/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// core libs
const process = require('process');
const crypto = require('crypto');

// local libs
const ProfilerError = require('./../error/ProfilerError');
const DataCollectorInterface = require('./../profiler/DataCollectorInterface');
const StopwatchPeriod = require('@conga/stopwatch').StopwatchPeriod;

/**
 * Keep track of global request time data
 * @type {{map: {}, num: number, max: number, total: number, mean: number, mode: number}}
 * @private
 */
const _time = {
    /**
     * Keep track of request times and how often they appear
     * @type {Object}
     */
    map: {},

    /**
     * Keep track of current highest mode occurrences
     * @type {Number}
     */
    num: 0,

    /**
     * Keep track of the max request time
     * @type {number}
     */
    max: 0,

    /**
     * Keep track of the total request time so we can compute the average
     * @type {number}
     */
    total: 0,

    /**
     * Keep track of the average (mean) request time
     * @type {number}
     */
    mean: 0,

    /**
     * Keep track of the average (mode) request time
     * @type {number}
     */
    mode: 0
};

/**
 * Keep track of the total request count so we can get an average of things
 * @type {number}
 * @private
 */
let _totalRequestCount = 0;

/**
 * Keep track of the active requests
 *
 * TODO: figure out what to do with rogue requests (requests that don't get stopped)
 *
 * @type {Object}
 * @private
 */
const _activeRequests = {};

/**
 * Keep track of the active request  count
 * @type {number}
 * @private
 */
let _activeRequestCount = 0;

/**
 * Keep track of the max active request count at any one time
 * @type {number}
 * @private
 */
let _maxActiveRequestCount = 0;

/**
 * The ProfilerRequestService keeps track of profiled requests
 */
class ProfilerRequestService {
    /**
     * @param {Object} container The service container
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Start profiling a request
     * @param {Object} request The conga request object
     * @param {Object} response The conga response object
     * @returns {Promise} a promise that resolves the profiler request document
     */
    startRequest(request, response) {
        if (request._profiler_id) {
            return Promise.reject(
                new ProfilerError('Request, "' + request._profiler_id + '", has already been started.')
            );
        }

        // generate a random profiler id
        const microtime = StopwatchPeriod.microtime();

        const id = request._profiler_id = response._profiler_id = crypto.createHash('sha1')
            .update(microtime + Math.random().toString())
            .digest('hex');

        const stopwatch = this.container.get('profiler.stopwatch')
            .request(request)
            .start('profiler.start', 'profiler');

        // get a request document
        const manager = this.container.get('profiler').getStorageManager();
        const document = manager.createDocument('Request', {
            request: {
                baseUrl: request.baseUrl,
                cookies: request.cookies,
                fresh: request.fresh,
                hostname: request.hostname,
                ip: request.ip,
                ips: request.ips,
                method: request.method,
                originalUrl: request.originalUrl,
                params: request.params,
                path: request.path,
                protocol: request.protocol,
                query: request.query,
                secure: request.secure,
                signedCookies: request.signedCookies,
                stale: request.stale,
                subdomains: request.subdomains,
                xhr: request.xhr,
                headers: request.headers
            },
            stats: [],
            pid: process.pid,
            activeRequests: this.getActiveRequestCount(),
            profilerId: id,
            isXhr: request.xhr,
            path: request.originalUrl,
            startedAt: microtime,
            createdAt: new Date()
        });

        // the first request stat is always the stat gathered prior to (or at the same of) the request
        const stat = this.container.get('profiler.stat').getCurrentStat();
        if (stat) {
            document.stats = [stat];
        }

        // hash our request document in the active requests collection
        _activeRequests[id] = document;
        _activeRequestCount++;
        _maxActiveRequestCount = Math.max(_maxActiveRequestCount, _activeRequestCount);

        // TODO: broadcast to listeners that we started a new request

        stopwatch.stop();

        // resolve the profiler request document
        return Promise.resolve(document);
    }

    /**
     * Stop a request from being profiled
     * @param {Object} request The conga request object
     * @param {Object} response The conga response object
     * @param {Array<DataCollectorInterface>} collectors The registered data collectors
     * @returns {Promise} a promise that resolves the profiler request document
     */
    stopRequest(request, response, collectors = []) {
        // initialize the profiler request document
        let document = null;

        // if the request isn't mapped, there's nothing to do
        if (!request || !(request._profiler_id in _activeRequests)) {
            return Promise.resolve(document);
        }

        // the document will live in the active request collection, not yet flushed to storage
        document = _activeRequests[request._profiler_id];

        // clear it from the active requests
        _activeRequests[request._profiler_id] = null;
        delete _activeRequests[request._profiler_id];
        _activeRequestCount--;

        // set the response data
        const trim = /^\s*|\s*$/g;
        document.response = {
            headers: (response._header || '').split('\r\n').reduce((obj, str) => {
                let [ key, value ] = str.split(':');
                if (!value) {
                    value = key;
                    key = '';
                }
                if (value) {
                    obj[key.replace(trim, '')] = value.replace(trim, '');
                }
                return obj;
            }, {}),
            hasBody: response._hasBody,
            contentLength: response._contentLength,
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            error: response.error
        };

        // compute the request time
        document.finishedAt = StopwatchPeriod.microtime();

        const diff = document.finishedAt - document.startedAt;
        document.requestTime = diff;

        // get the security token (if applicable)
        if (this.container.has('security.context')) {
            const securityContext = this.container.get('security.context');
            document.authToken = securityContext && securityContext.getAuthToken();
        }

        // get the firewall the request went through (if applicable)
        if (this.container.has('security.firewall')) {
            document.firewall = this.container.get('security.firewall').getFirewallForRequest(request);
        }

        // compute the average (mode) request time
        let num = 0;
        if (!(diff in _time.map)) {
            num = _time.map[ diff ] = 1;
        } else {
            num = ++_time.map[ diff ];
        }
        if (num > _time.num) {
            _time.num = num;
            _time.mode = diff;
        }

        // compute the max and mean request times
        _totalRequestCount += 1;
        _time.total += diff;
        _time.max = Math.max(_time.max, diff);
        _time.mean = _time.total / _totalRequestCount;

        // collect all of the profile data for this request
        return this.collectDataForRequest(collectors, request, response, document).then(collected => {
            // persist the request data (in the background)
            document.collectedData = {};
            for (let x in collected) {
                if (collected[x] && collected[x] instanceof Object) {
                    document.collectedData[x] = collected[x];
                }
            }

            // persist and flush our request document (we do this together so we control when it gets flushed)
            const manager = this.container.get('profiler').getStorageManager();
            manager.persist(document);

            // flush everything (so we get included stats)
            manager.flush().catch(err => console.error(err.stack || err));

            // TODO: broadcast to listeners that we finished a request

            // resolve the profiler request document
            return Promise.resolve(document);
        }).catch(err => Promise.reject(err));
    }

    /**
     * See if a request is mapped
     * @param {Object} request The conga request object
     * @returns {boolean}
     */
    isMappedRequest(request) {
        return request._profiler_id !== undefined;
    }

    /**
     * Get the profiler id for a given request
     * @param {Object} request The conga request object
     * @returns {String}
     */
    getMappedRequestId(request) {
        return request._profiler_id;
    }

    /**
     * Get the average request time
     * @returns {number}
     */
    getMeanRequestTime() {
        return _time.mean;
    }

    /**
     * Get the average (mode) request time
     * @returns {number}
     */
    getAverageRequestTime() {
        return _time.mode;
    }

    /**
     * Get the max request time
     * @returns {number}
     */
    getMaxRequestTime() {
        return _time.max;
    }

    /**
     * Get the total number of current active requests
     * @returns {number}
     */
    getActiveRequestCount() {
        return _activeRequestCount;
    }

    /**
     * Get the max number of current active requests at any given time
     * @returns {number}
     */
    getMaxActiveRequestCount() {
        return _maxActiveRequestCount;
    }

    /**
     * Get the current active requests
     * @returns {Object}
     */
    getActiveRequests() {
        return _activeRequests;
    }

    /**
     * Get the total request count
     * @returns {number}
     */
    getTotalRequestCount() {
        return _totalRequestCount;
    }

    /**
     * Get a mapped request by its profiler id
     * @param {String} profilerId The profiler id
     * @returns {Promise} a promise that resolves a profiler Request document
     */
    getRequestById(profilerId) {
        if (profilerId in _activeRequests) {
            return _activeRequests[ profilerId ];
        }
        return this.container.get('profiler').getStorageManager()
            .findOneBy('Request', { profilerId }, {createdAt: -1});
    }

    /**
     * Get requests by a criteria
     * @param {Object} criteria Any criteria object
     * @param {{[sort]:Object, [skip]:number, [limit]:number}} options arguments to pass to findBy
     * @returns {Promise}
     */
    getRequestsBy(criteria, options) {
        const { sort, skip, limit } = options;
        return this.container.get('profiler').getStorageManager()
            .findBy('Request', criteria, sort, skip, limit);
    }

    /**
     * Get the parent request for a given request object
     * @param {Object} request The Conga (express) request object
     * @returns {Promise}
     */
    getParentRequest(request) {
        if (!request.headers.referer) {
            return Promise.resolve(null);
        }
        const path = request.headers.referer.replace(/^[^:]*:*\/\//, '');
        return this.container.get('profiler').getStorageManager()
            .findOneBy('Request', { path }, {createdAt: -1});
    }

    /**
     * Get all the child requests for a given request object
     * @param {Object} request The Conga (express) request object
     * @param {Object} [sort] The sorting argument for findBy - sorted by createdAt ASC by default
     * @returns {Promise}
     */
    getChildRequests(request, sort = {createdAt: -1}) {
        const referer = request.protocol + '://' + request.headers.host + request.originalUrl;
        return this.getRequestsBy({isXhr: true, request: {headers: { referer }}}, { sort });
    }

    /**
     * Collect all the profiled data for this request
     * @param {Array<Object>} dataCollectors The registered data collector tags
     * @param {Object} request The conga request object
     * @param {Object} response The conga response object
     * @param {Request} [document] The Profiler Request document
     * @returns {Promise}
     */
    collectDataForRequest(dataCollectors, request, response, document = null) {
        if (request._profiler_id === undefined) {
            return Promise.reject(new ProfilerError('Request Not Mapped'));
        }
        // stopwatch event
        const stopwatch = this.container.get('profiler.stopwatch')
            .request(request).start('profiler.collector', 'profiler');
        // the collected data
        const collected = {};
        // execute all collectors asynchronously
        return Promise.all(dataCollectors.map((collector, idx) => {
            // if (!(collector instanceof DataCollectorInterface)) {
            //     throw new ProfilerError(
            //         'One or more registered data collectors do not inherit from ' +
            //         '@conga/framework-profiler:profiler/DataCollectorInterface');
            // }
            if (idx > 0) {
                stopwatch.lap();
            }
            // if the collector is not enabled, don't collect anything
            if (!collector.isEnabled()) {
                return Promise.resolve(null);
            }
            // collect the data from the collector
            return collector.collectData(request, response, document).then(data => {
                // aggregate the data from each collector with the collected request data
                collected[collector.getName()] = data;
                // resolve with the data
                return Promise.resolve(data);
            });
        }))
        .then(data => stopwatch.stop() && Promise.resolve(collected))
        .catch(err => stopwatch.stop() && Promise.reject(err));
    }
}

module.exports = ProfilerRequestService;

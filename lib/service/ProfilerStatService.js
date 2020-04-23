/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// core modules
const os = require('os');
const process = require('process');

// third party bundles
const pidusage = require('pidusage');

// framework modules
const StopwatchPeriod = require('@conga/stopwatch').StopwatchPeriod;

/**
 * Persistence threshold representing persist everything
 * @type {string}
 */
const PERSIST_THRESHOLD_ALL = 'all';

/**
 * Persistence threshold representing only persist stats associated to requests
 * @type {string}
 */
const PERSIST_THRESHOLD_REQUEST = 'request';

/**
 * Delay to use when a request is in progress
 * @type {number}
 */
const DELAY_REQUEST = 50;

/**
 * Delay to use when no requests are in progress
 * @type {number}
 */
const DELAY_IDLE = 1000;

/**
 * Stop the stat monitoring
 * @type {number}
 */
const DELAY_STOP = -1;

/**
 * The monitor-stats interval
 * @type {number|null}
 * @private
 */
let _intv = null;

/**
 * Keep track of how many iterations we have made
 * @type {number}
 * @private
 */
let _intv_count = 0;

/**
 * Keep track of the last interval delay used
 * @type {number|null}
 * @private
 */
let _delay = null;

/**
 * The current ProcessStat
 * @type {ProcessStat|null}
 * @private
 */
let _currentStat = null;

/**
 * Keep track of hops so we can compute things
 * @type {number}
 * @private
 */
let _hops = 0;

/**
 * Keep track of global CPU stats
 * @type {{map: {}, num: {}, key: number, max: number, total: number, mean: number, mode: number}}
 * @private
 */
let _cpu = {
    /**
     * Keep track of cpu stats and how often they appear {stat: num_appear}
     * @type {{}}
     */
    map: {},

    /**
     * Keep track of the key to the numCpuMap with the highest occurrence
     * @type {number}
     */
    num: 0,

    /**
     * Keep track of the max CPU usage
     * @type {number}
     */
    max: 0,

    /**
     * Keep track of the total CPU usage so we can compute the average
     * @type {number}
     */
    total: 0,

    /**
     * Keep track of the mean CPU usage
     * @type {number}
     */
    mean: 0,

    /**
     * Keep track of the average (mode) cpu stat
     * @type {number}
     * @private
     */
    mode: 0
};

/**
 * Keep track of global memory stats
 * @type {{map: {}, num: {}, key: number, max: number, total: number, mean: number, mode: number}}
 * @private
 */
let _memory = {
    /**
     * Keep track of memory stats and how often they appear {stat: num_appear}
     * @type {{}}
     */
    map: {},

    /**
     * Keep track of the key to the numMemoryMap with the highest occurrence
     * @type {number}
     */
    num: 0,

    /**
     * Keep track of the max memory
     * @type {number}
     * @private
     */
    max: 0,

    /**
     * Keep track of the total memory used so we can compute the averate
     * @type {number}
     */
    total: 0,

    /**
     * Keep track of the average memory consumption
     * @type {number}
     */
    mean: 0,

    /**
     * Keep track of the average (mode) memory stat
     * @type {number}
     * @private
     */
    mode: 0
};

/**
 * The ProfilerStatService monitors the os process (pid) performance and logs stats on an interval into storage
 */
class ProfilerStatService {
    /**
     * @param {ProfilerService} profiler The profiler service
     * @param {ProfilerRequestService} profilerRequest The profiler request service
     * @constructor
     */
    constructor(profiler, profilerRequest) {
        this.profiler = profiler;
        this.profilerRequest = profilerRequest;

        this._monitoringEnabled = false;
    }

    /**
     * Get the delay value for idle processes
     * @returns {number}
     */
    get DELAY_IDLE() {
        if (this._delayIdle) {
            return this._delayIdle;
        }
        let delay = DELAY_IDLE;
        if (this.isMonitoringEnabled()) {
            delay = this.profiler.getProfilerConfig().monitoring.delay_idle || DELAY_IDLE
        }
        this._delayIdle = delay;
        return delay;
    }

    /**
     * Get the delay value used while requests are in progress
     * @returns {number}
     */
    get DELAY_REQUEST() {
        if (this._delayRequest) {
            return this._delayRequest;
        }
        let delay = DELAY_REQUEST;
        if (this.isMonitoringEnabled()) {
            delay = this.profiler.getProfilerConfig().monitoring.delay_request || DELAY_REQUEST
        }
        this._delayRequest = delay;
        return delay;
    }

    /**
     * Get the delay value representing to halt the interval
     * @returns {number}
     */
    get DELAY_STOP() { return DELAY_STOP; }

    /**
     * Get a storage manager
     * @returns {Manager}
     */
    getStorageManager() {
        return this.profiler.getStorageManager();
    }

    /**
     * See if monitoring is enabled
     * @returns {boolean}
     */
    isMonitoringEnabled() {
        if (!this.profiler.isEnabled()) {
            return false;
        }
        if (this._monitoringEnabled) {
            return true;
        }
        const config = this.profiler.getProfilerConfig();
        const isEnabled = config instanceof Object &&
                          (config.monitoring === undefined || (config.monitoring instanceof Object &&
                                                               config.monitoring.enabled));
        this._monitoringEnabled = isEnabled;
        return isEnabled;
    }

    /**
     * See if the current stat monitor "interval" delay matches a value
     * @param {Number} delay The delay to check for
     * @returns {boolean}
     * @private
     */
    isMonitorDelay(delay) {
        return delay === _delay;
    }

    /**
     * Monitor process status on an "interval"
     * @param {number} delay The interval delay
     * @returns {void}
     * @private
     */
    startMonitoring(delay) {
        if (_intv) {
            clearTimeout(_intv);
        }

        if (!this.isMonitoringEnabled()) {
            return;
        }

        _delay = delay;

        const persistThreshold = this.profiler.getProfilerConfig().monitoring.persist;
        const isPersistAll = persistThreshold === PERSIST_THRESHOLD_ALL;

        const activeRequests = this.profilerRequest.getActiveRequests();

        pidusage(process.pid, (err, stat) => {

            _hops += 1;

            // compute total, mean and max cpu
            _cpu.total += stat.cpu;
            _cpu.max = Math.max(_cpu.max, stat.cpu);
            _cpu.mean = _cpu.total / _hops;

            // compute the average (mode) cpu time
            let num = 0;
            let val = Math.round(stat.cpu);
            if (!(val in _cpu.map)) {
                num = _cpu.map[ val ] = 1;
            } else {
                num = ++_cpu.map[ val ];
            }
            if (num > _cpu.num) {
                _cpu.num = num;
                _cpu.mode = val;
            }

            // compute total, mean, and max memory
            _memory.total += stat.memory;
            _memory.max = Math.max(_memory.max, stat.memory);
            _memory.mean = _memory.total / _hops;

            // compute the average (mode) memory
            num = 0;
            val = Math.round(stat.memory);
            if (!(val in _memory.map)) {
                num = _memory.map[ val ] = 1;
            } else {
                num = ++_memory.map[ val ];
            }
            if (num > _memory.num) {
                _memory.num = num;
                _memory.mode = val;
            }

            // get a new hydrated ProcessStat document
            const manager = this.profiler.getStorageManager();
            const processStat = manager.createDocument('ProcessStat', {
                pid: process.pid,
                activeRequests: this.profilerRequest.getActiveRequestCount(),
                maxActiveRequests: this.profilerRequest.getMaxActiveRequestCount(),
                meanRequestTime: this.profilerRequest.getMeanRequestTime(),
                avgRequestTime: this.profilerRequest.getAverageRequestTime(),
                maxRequestTime: this.profilerRequest.getMaxRequestTime(),
                requestPerSec: Math.max(0, (this.profilerRequest.getTotalRequestCount() / process.uptime()) || 0),
                cpu: stat.cpu,
                meanCpu: _cpu.mean,
                avgCpu: _cpu.mode,
                maxCpu: _cpu.max,
                cpuUsage: stat.cpuUsage,
                memory: stat.memory,
                meanMemory: _memory.mean,
                avgMemory: _memory.mode,
                maxMemory: _memory.max,
                loadAvg: os.loadavg(),
                iterationsSinceGC: ++_intv_count,
                intervalSpeed: _delay,
                microtime: StopwatchPeriod.microtime(),
                createdAt: new Date()
            });

            if (isPersistAll) {
                // persist (buffer) it with the manager so when we flush it saves
                manager.persist(processStat);
            }

            // save this stat as the current-stat
            _currentStat = processStat;

            // TODO : broadcast to listeners that we have a new process stat

            // add this ProcessStat to all of the active requests (in background)
            for (let profilerId in activeRequests) {
                activeRequests[ profilerId ].stats.push( processStat );
            }

            // https://github.com/soyuka/pidusage/issues/17
            if (_intv_count >= 200 || (Math.random() * 100 > 80 && _intv_count > 10)) {
                // reset the counter
                _intv_count = 0;

                if (isPersistAll) {
                    // flush the data storage (in background) to save all the documents in the buffer
                    manager.flush().catch(err => console.error(err.stack || err));
                }

                // manually call garbage collection
                global.gc && global.gc();
            }

            // the request is done, so if we were told to stop monitoring, do so now
            if (this.isMonitorDelay(this.DELAY_STOP)) {
                return;
            }

            // the request is done, so if there are no more active requests, change delay time to idle
            let delay = _delay;
            if (delay !== this.DELAY_IDLE && this.profilerRequest.getActiveRequestCount() === 0) {
                delay = this.DELAY_IDLE;
            }

            // re-activate monitoring with the new delay time (RECURSION)
            _intv = setTimeout(this.startMonitoring.bind(this), delay, delay);
        });
    }

    /**
     * Clear the process status "interval"
     * @returns {void}
     * @private
     */
    stopMonitoring() {
        if (_intv) {
            clearTimeout(_intv);
        }
        _delay = this.DELAY_STOP;
    }

    /**
     * Get the current process stat
     * @returns {ProcessStat|null}
     */
    getCurrentStat() {
        return _currentStat;
    }

    /**
     * Get the max CPU usage
     * @returns {number}
     */
    getMaxCpu() {
        return _maxCpu;
    }

    /**
     * Get the mean CPU usage
     * @returns {number}
     */
    getMeanCpu() {
        return _meanCpu;
    }

    /**
     * Get the average (mode) CPU usage
     * @returns {number}
     */
    getAverageCpu() {
        return _modeCpu;
    }

    /**
     * Get the max memory consumption
     * @returns {number}
     */
    getMaxMemory() {
        return _maxMemory;
    }

    /**
     * Get the mean memory consumption
     * @returns {number}
     */
    getMeanMemory() {
        return _meanMemory;
    }

    /**
     * Get the average (mode) CPU usage
     * @returns {number}
     */
    getAverageMemory() {
        return _modeMemory;
    }
}

module.exports = ProfilerStatService;
/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The Profiler services handles tasks related to the profiler
 */
class ProfilerService {
    /**
     * @param {Object} container The service container
     * @constructor
     */
    constructor(container) {
        this.container = container;
    }

    /**
     * Get the configuration object
     * @returns {*}
     */
    getConfig() {
        if (!this._config) {
            this._config = this.container.get('config');
        }
        return this._config;
    }

    /**
     * Get the profiler configuration object
     * @returns {*}
     */
    getProfilerConfig() {
        if (!this._profilerConfig) {
            this._profilerConfig = this.getConfig().get('profiler');
        }
        return this._profilerConfig;
    }

    /**
     * Get the bass storage manager
     * @param {boolean} [newSession] true to get a new session, false to use cache
     * @returns {Manager|null}
     */
    getStorageManager(newSession = false) {
        if (!newSession && this._manager) {
            return this._manager;
        }

        const config = this.getProfilerConfig().bass;
        if (!config || !config.manager) {
            return null;
        }

        const manager = this.container.get('bass').createSession().getManager(config.manager);

        if (!this._manager) {
            this._manager = manager;
        }

        return manager;
    }

    /**
     * See if the profiler is enabled or not (globally or for a request)
     * @param {Object} [request] The CongaJS request object
     * @returns {boolean|string} returns string if 'enabled' represents "request" and no request was provided (ie called in global scope), otherwise, boolean is returned
     */
    isEnabled(request = null) {
        const config = this.getProfilerConfig();

        let isEnabled = config instanceof Object &&
                        (config.enabled === undefined || config.enabled);

        if (isEnabled === 'request' && request) {
            isEnabled = this.container.get('profiler.request.matcher').matches(request);
        }

        return isEnabled;
    }
}

module.exports = ProfilerService;
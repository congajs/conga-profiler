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
        this._enabled = false;
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
     * See if the profiler is enabled or not
     * @returns {boolean}
     */
    isEnabled() {
        if (this._enabled) {
            return true;
        }
        const config = this.getProfilerConfig();
        const isEnabled = config instanceof Object &&
                          (config.enabled === undefined || config.enabled);

        this._enabled = isEnabled;

        // TODO: check matchers if not isEnabled

        return isEnabled;
    }
}

module.exports = ProfilerService;
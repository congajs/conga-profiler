/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const DataCollectorInterface = require('./../profiler/DataCollectorInterface');

/**
 * Recursively go through all object keys and replace $ and . with unicode characters (for mongo)
 * @param {Object|*} obj
 * @returns {Object|*}
 */
const recursiveKeys = (obj) => {
    if (!(obj instanceof Object) || Array.isArray(obj)) {
        return obj;
    }

    const temp = {};
    const dollarReg = /\$/g;
    const dollarRep = '\uFF04';
    const dotReg = /\./g;
    const dotRep = '\uFF0E';

    for (let key of Object.keys(obj)) {
        // recursion
        temp[key.replace(dollarReg, dollarRep).replace(dotReg, dotRep)] = recursiveKeys(obj[key]);
    }

    return temp;
};

/**
 * Flatten an object with nested objects into one object with respective key names
 * @param {Object} obj The object to flatten
 * @param {String} [nestKey] The key from the previous level
 * @returns {Object}
 */
const flatten = (obj, nestKey = null) => {
    const flat = {};
    const dollarReg = /\$/g;
    const dollarRep = '&#36;';
    const dotReg = /\./g;
    const dotRep = '&#46;';
    for (let key in obj) {
        let flatKey = key;
        if (nestKey) {
            flatKey = (nestKey + '.' + key).replace(dollarReg, dollarRep).replace(dotReg, dotRep);
        }
        const val = obj[key];
        if (val instanceof Object) {
            // recursion
            Object.assign(flat, flatten(val, flatKey));
        } else {
            flat[flatKey] = val;
        }
    }
    return flat;
};

/**
 * The config data collector service
 */
class ConfigDataCollector extends DataCollectorInterface {
    /**
     * @param {Container} container The service container
     */
    constructor(container) {
        super();
        this.container = container;
    }

    /**
     * {@inheritDoc}
     */
    getName() {
        return 'Configuration';
    }

    /**
     * {@inheritDoc}
     */
    getTemplate() {
        return '@conga/framework-profiler:collector/config.html.twig';
    }

    /**
     * {@inheritDoc}
     */
    hasDashboard() {
        return true;
    }

    /**
     * {@inheritDoc}
     */
    isEnabled() {
        const enabled = this.container.get('config').get('profiler').collect_config;
        return enabled === undefined || enabled;
    }

    /**
     * {@inheritDoc}
     */
    collectData(request, response, document = null) {
        let flat = flatten(this.container.get('config').parameters);
        return Promise.resolve({
            configFlat: Object.keys(flat).sort().reduce((sorted, key) => {
                sorted[key] = flat[key];
                return sorted;
            }, {}),
            services: recursiveKeys(Object.keys(this.container.getServices()))
        });
    }
}

module.exports = ConfigDataCollector;
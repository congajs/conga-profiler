/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const LogicError = require('./../error/LogicError');

/**
 * Define a common interface for data collectors
 * @interface
 */
class DataCollectorInterface {
    /**
     * Get the name for this data collector
     * @returns {String}
     * @abstract
     */
    getName() {
        throw new LogicError('You must implement DataCollectorInterface.getName.');
    }

    /**
     * Get the template path for this collector in the dashboard
     * @returns {null}
     * @abstract
     */
    getTemplate() {
        throw new LogicError('You must implement DataCollectorInterface.getTemplate.');
    }

    /**
     * See if this data collector has a dashboard view
     * @returns {true|false}
     * @abstract
     */
    hasDashboard() {
        throw new LogicError('You must implement DataCollectorInterface.hasDashboard.');
    }

    /**
     * See if this collector is enabled or not
     * @returns {Boolean}
     * @abstract
     */
    isEnabled() {
        throw new LogicError('You must implement DataCollectorInterface.isEnabled.');
    }

    /**
     * Collect data for a request
     * @param {Object} request The Conga request (express) object
     * @param {Object} response The Conga response (express) object
     * @param {Request} [document] The Profiler Request document
     * @abstract
     */
    collectData(request, response, document = null) {
        throw new LogicError('You must implement DataCollectorInterface.collectData.');
    }
}

module.exports = DataCollectorInterface;
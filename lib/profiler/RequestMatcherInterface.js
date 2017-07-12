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
 * @interface
 */
class RequestMatcherInterface {
    /**
     * See if a request "matches" and should be profiled
     * @param {Object} request The congajs request object
     * @returns {Boolean}
     * @abstract
     */
    matches(request) {
        throw new LogicError('You custom matcher must implement the abstract method, "matches".');
    }
}

module.exports = RequestMatcherInterface;
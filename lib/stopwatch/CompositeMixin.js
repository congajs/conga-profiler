/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Overwrite the CompositeStopwatch to provide logic for dealing with requests
 * @param {CompositeStopwatch} parent The parent class to extend
 * @return {Class}
 */
module.exports = parent => class CompositeMixin extends parent {
    /**
     * {@inheritDoc}
     */
    constructor(name = null) {
        super(name);
        this._request = null;
    }

    /**
     * Associate this section with a request profiler id
     * @param {Object} request The conga (express) request object to associate
     * @returns {CompositeStopwatch}
     */
    setRequest(request) {
        this._request = { _profiler_id: request._profiler_id };
        return this;
    }

    /**
     * See if a request is associated to this section
     * @param {Object} [request] If not provided returns true if any request is associated to this section
     * @returns {boolean|String|*|null}
     */
    hasRequest(request = null) {
        if (request === null) {
            return !!this._request;
        }
        return this.hasProfilerId(request._profiler_id || 0);
    }

    /**
     * See if this section has a profiler id
     * @param {String} [id] If provided, see if the id matches, if not see if there is an id on this section
     * @returns {boolean|String|*|null}
     */
    hasProfilerId(id = null) {
        if (id === null) {
            return !this._request || this._request._profiler_id === undefined;
        }
        return this._request && this._request._profiler_id === id;
    }

    /**
     * Create a new section for a request
     * @param {Object} request The conga (express) request object
     * @param {String} [name] The name of the section
     * @returns {CompositeStopwatch}
     */
    request(request, name = null) {
        return this.section(name).setRequest(request);
    }

    /**
     * Get a JSON (plain object) representation of this instance
     * @return {Object}
     */
    toJSON() {
        return Object.assign(super.toJSON(), {
            profilerId: this._request && this._request._profiler_id,
        });
    }
};
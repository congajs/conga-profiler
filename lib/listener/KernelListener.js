/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Keep track of registered data collector tags
 * @type {Array}
 */
let collectorTags = [];

/**
 * Listen and respond to kernel events
 */
class KernelListener {
    /**
     * Register all of the data collectors at compile time
     * @param {Object} event The event object
     * @param {Function} next The function to invoke on the next event listener in the series
     * @returns {void}
     */
    onKernelCompile(event, next) {
        const { container } = event;

        // constantly monitor the server process
        const stat = container.get('profiler.stat');
        stat.startMonitoring(stat.DELAY_IDLE);

        // find all the tagged data-collectors
        const tags = container.getTagsByName('profiler.data_collector');

        // if we have no tagged data-collectors, move on
        if (!tags || tags.length === 0) {
            next();
            return;
        }

        // sort the tags by priority
        container.get('conga.ioc.tag.sorter').sortByPriority(tags);

        // save the collector tags so we can fetch the services on demand
        // we do it this way so that the services can live in different scopes
        collectorTags = tags;

        next();
    }

    /**
     * When the request is finished, stop the request from being profiled
     * @param event
     * @param next
     */
    onResponse(event, next) {
        // processing is done in the background
        next();

        const { container, request, error } = event;

        if (!container.get('profiler').isEnabled()) {
            return;
        }

        let response = Object.create(event.response);
        response.error = error;

        // get all the collectors in the current (request) scope (also includes global)
        let collectors = collectorTags.map(tag => container.get(tag.getServiceId()));

        container.get('profiler.request').stopRequest(request, response, collectors)
            .catch(err => console.error(err.stack || err));
    }

    /**
     * When the request is finished, stop the request from being profiled
     * @param event
     * @param next
     */
    onErrorResponse(event, next) {
        this.onResponse(event, next);
    }
}

module.exports = KernelListener;
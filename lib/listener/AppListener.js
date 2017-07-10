/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The AppListener is used to respond to app-level events (app.pre_middleware, etc)
 */
class AppListener {
    /**
     * Register middleware for the profiler bundle
     * @param {Object} container The global service container
     * @param {Object} app The (express.js) app
     * @param {Function} next The callback to invoke the next event in the series
     */
    preRegisterMiddleware(container, app, next) {

        // register middleware for the profiler to start tracking the request
        app.use((request, response, callback) => {

            // if the profiler isn't enabled, move on
            if (!container.get('profiler').isEnabled()) {
                callback();
                return;
            }

            // make sure we're monitoring (when allowed)
            const stat = container.get('profiler.stat');

            if (!stat.isMonitorDelay(stat.DELAY_REQUEST)) {
                stat.startMonitoring(stat.DELAY_REQUEST);
            }

            // start the request with the profiler
            container.get('profiler.request')
                .startRequest(request, response)
                .then(document => callback())
                .catch(err => console.error(err.stack || err));

        });

        // register middleware for the profiler to catch errors
        app.use((error, request, response, callback) => {

            // processing is done in the background
            callback();

            // if the profiler isn't enabled, move on
            if (!container.get('profiler').isEnabled()) {
                return;
            }

            response.error = error;

            // stop the request with the profiler
            container.get('profiler.request')
                .stopRequest(request, response)
                .catch(err => console.error(err.stack || err));

        });

        // call the next pre-middleware event
        next();

    }
}

module.exports = AppListener;
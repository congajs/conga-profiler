/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// framework libs
const Controller = require('conga-framework').Controller;

/**
 * Get the data collector navigation
 * @param {Array<String>} keys The data collector keys (names)
 * @param {DashboardService} service The dashboard service
 * @returns {Array<String>} The filtered list of keys
 */
const navigation = (keys, service) => keys.filter(key => {
    const collector = service.getCollector(key);
    return collector.isEnabled() && collector.hasDashboard();
});

/**
 * The DashboardController handles all the routes necessary for the backend profiler panel's view
 *
 * @Route('/_profiler/dashboard')
 *
 * @Firewall(realm="conga_profiler",
 *           roles=["ROLE_PROFILER"],
 *           stateless=false,
 *           authenticator="@profiler.security.authenticator",
 *           provider="@profiler.security.provider")
 *
 */
class DashboardController extends Controller {
    /**
     * @Route("/", name="_profiler.dashboard.home", methods=["GET"])
     * @Template
     */
    index(req, res) {
        const profilerRequest = this.container.get('profiler.request');
        const profilerDashboard = this.container.get('profiler.dashboard');
        const token = this.container.get('security.context').getAuthToken();

        return profilerRequest.getRequestsBy({}, {sort: {createdAt: -1}, limit: 10}).then(requests => {
            var data = {
                token,
                requests,
                navigation: requests.length === 0 ? [] : navigation(Object.keys(requests[0].collectedData), profilerDashboard)
            };
            return Promise.resolve(data);
        }).catch(err => stopwatch.ensureStopped() && res.return({error: err.stack || err}, 500));
    }

    /**
     * @Route("/request/:profilerId", name="_profiler.dashboard.request", methods=["GET"])
     * @Template
     */
    request(req, res) {
        const profilerRequest = this.container.get('profiler.request');
        const profilerDashboard = this.container.get('profiler.dashboard');
        const token = this.container.get('security.context').getAuthToken();

        const stopwatch = this.container.get('profiler.stopwatch').request(req);

        let stopwatchEvent = stopwatch.start('get.request', 'profiler.dashboard');

        return profilerRequest.getRequestById(req.params.profilerId).then(document => {
            const data = {
                token,
                children: [],
                request: document,
                navigation: navigation(Object.keys(document.collectedData), profilerDashboard)
            };
            stopwatchEvent.stop();
            let childStopwatch = stopwatch.start('get.request.children', 'profiler.dashboard');
            let parentStopwatch = stopwatch.start('get.request.parent', 'profiler.dashboard');
            return Promise.all([
                profilerRequest.getChildRequests(document.request).then(children => {
                    childStopwatch.stop();
                    data.children = children || [];
                    return Promise.resolve(children);
                }).catch(err => childStopwatch.stop() && Promise.reject(err)),
                profilerRequest.getParentRequest(document.request).then(parent => {
                    parentStopwatch.stop();
                    data.parent = parent;
                    return Promise.resolve(parent);
                }).catch(err => parentStopwatch.stop() && Promise.reject(err))
            ]).then(all => {

                stopwatch.ensureStopped();

                return Promise.resolve(data);

            }).catch(err => stopwatchEvent.stop() && Promise.reject(err));
        }).catch(err => stopwatch.stop() && res.return({error: err.stack || err}, 500));
    }

    /**
     * @Route("/request/:profilerId/:collectorName", name="_profiler.dashboard.request.collector", methods=["GET"])
     * @Template
     */
    requestCollector(req, res) {
        const profilerRequest = this.container.get('profiler.request');
        const profilerDashboard = this.container.get('profiler.dashboard');
        const token = this.container.get('security.context').getAuthToken();

        const stopwatch = this.container.get('profiler.stopwatch').request(req);

        let stopwatchEvent = stopwatch.start('get.request', 'profiler.dashboard');

        return profilerRequest.getRequestById(req.params.profilerId).then(document => {

            const collector = profilerDashboard.getCollector(req.params.collectorName);

            const data = document.collectedData[req.params.collectorName];
            const returnData = {
                token,
                data,
                collector,
                template: collector && collector.getTemplate(),
                request: document,
                collectorName: req.params.collectorName,
                navigation: navigation(Object.keys(document.collectedData), profilerDashboard)
            };

            stopwatchEvent.stop();

            stopwatchEvent = stopwatch.start('get.request.parent', 'profiler.dashboard');

            return Promise.all([
                profilerRequest.getParentRequest(document.request).then(parent => {
                    stopwatchEvent.stop();
                    returnData.parent = parent;
                    return Promise.resolve(parent);
                })
            ]).then(all => {

                stopwatch.ensureStopped();

                return Promise.resolve(returnData);

            }).catch(err => stopwatchEvent.lap() && Promise.reject(err));

        }).catch(err => stopwatch.ensureStopped() && res.return({error: err.stack || err}, 500));
    }
}

module.exports = DashboardController;
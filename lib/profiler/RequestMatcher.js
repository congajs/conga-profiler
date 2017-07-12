/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const RequestMatcherInterface = require('./RequestMatcherInterface');
const LogicError = require('./../error/LogicError');

/**
 * The request matcher checks to see if the profiler matches a route or IP address
 */
class RequestMatcher extends RequestMatcherInterface {
    /**
     *
     * @param {Container} container The service container
     */
    constructor(container) {
        super();
        this.container = container;
    }

    /**
     * {@inheritDoc}
     */
    matches(request) {
        const config = this.container.get('profiler').getProfilerConfig().matchers;
        if (!(config instanceof Object)) {
            return false;
        }
        let name;
        for (name in config) {
            let matcher = config[name];
            if (typeof matcher === 'string') {
                // we have to check for this on each request because the service may live in the request scope
                // and so we cannot gather them on compile
                // NOTE: if performance becomes an issue, we can gather the sid's on compile and perform the regexp there
                let sid = matcher.replace(/^@/, '');
                if (this.container.has(sid)) {
                    matcher = this.container.get(sid);
                    if (!(matcher instanceof RequestMatcherInterface)) {
                        throw new LogicError('Invalid matcher configuration provided as, "' + name + '".');
                    }
                    return matcher.matches(request);
                }
            } else if (matcher instanceof Object) {
                if (matcher.ip) {
                    return matcher.ip === request.ip;
                } else if (matcher.route) {
                    let regexp = new RegExp(matcher.route);
                    return regexp.test(request.originalUrl);
                }
            } else {
                throw new LogicError('Invalid matcher configuration provided as, "' + name + '".');
            }
        }
    }
}

module.exports = RequestMatcher;
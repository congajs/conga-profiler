/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// global libs
const process = require('process');

// framework libs
const { StopwatchEvent, StopwatchPeriod } = require('conga-stopwatch');

// local libs
const DataCollectorInterface = require('./../../profiler/DataCollectorInterface');
const Stopwatch = require('./../../stopwatch/Stopwatch');

/**
 * Minimum request time to check for removal of sections (microseconds)
 * @type {Number}
 */
const minRequestTime = 1500000; // 1.5 seconds

/**
 * Reduce the entire global stopwatch data and return only data for a specific start / end time
 * @param {CompositeStopwatch} recurse The stopwatch data you are reducing / recursing
 * @param {Stopwatch} preserve The stopwatch you are reducing into
 * @param {Object} request The conga (express) request object
 * @param {Number} startedAt The start time in milliseconds
 * @param {Number} finishedAt The end time in milliseconds
 * @param {Number} maxRequestTime The maximum known request time
 * @returns {void}
 */
const reduceStopwatchData = (recurse, preserve, request, startedAt, finishedAt, maxRequestTime) => {
    for (let section of recurse.sections) {
        if (section.hasRequest(request)) {

            preserve.sections.push(section);

            // remove the request collection after we collect it
            process.nextTick(() => recurse.removeSection(section));

        } else if (!section.hasRequest()) {

            let useSection = null;
            for (let event of section.events) {
                let useEvent = null;
                for (let period of event.periods) {
                    // if it started within the given request (no matter when it finished) log it
                    if (period.start >= startedAt && period.start <= finishedAt) {
                        if (!useSection) {
                            useSection = preserve.section(section.name);
                        }
                        if (!useEvent) {
                            useEvent = new StopwatchEvent(event.name, event.category);
                            useSection.events.push(useEvent);
                        }
                        useEvent.periods.push(period);
                    } else if (StopwatchPeriod.microtime() - period.start > maxRequestTime) {
                        // remove the global section if it's older than max request time
                        process.nextTick(() => recurse.removeSection(section));
                    }
                }
            }

            reduceStopwatchData(section, preserve, request, startedAt, finishedAt, maxRequestTime);
        }
    }
};

/**
 * The stopwatch data collector service
 */
class DataCollector extends DataCollectorInterface {
    /**
     * @param {Stopwatch} stopwatch The stopwatch service
     * @param {ProfilerRequestService} profilerRequest The profiler request service
     */
    constructor(stopwatch, profilerRequest) {
        super();
        this.stopwatch = stopwatch;
        this.profilerRequest = profilerRequest;
    }

    /**
     * {@inheritDoc}
     */
    getName() {
        return 'Stopwatch';
    }

    /**
     * {@inheritDoc}
     */
    getTemplate() {
        return 'conga-profiler:collector/stopwatch.html.twig';
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
        return true;
    }

    /**
     * {@inheritDoc}
     */
    collectData(request, response, document = null) {
        if (!document) {
            return Promise.resolve({});
        }

        const reducedStopwatch = new Stopwatch();

        reduceStopwatchData(
            this.stopwatch,
            reducedStopwatch,
            request,
            document.startedAt,
            document.finishedAt,
            Math.max(minRequestTime, this.profilerRequest.getMaxRequestTime())
        );

        return Promise.resolve(reducedStopwatch.toJSON());
    }
}

module.exports = DataCollector;
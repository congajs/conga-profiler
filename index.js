/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// framework libs
const CongaStopwatch = require('@conga/stopwatch');

module.exports = {

    Collector: {
        DataCollectorInterface: require('./lib/profiler/DataCollectorInterface')
    },

    Error: {
        ProfilerError: require('./lib/error/ProfilerError'),
        LogicError: require('./lib/error/LogicError')
    },

    Stopwatch: Object.assign({}, CongaStopwatch, {
        Stopwatch: require('./lib/stopwatch/Stopwatch'),
        CompositeMixin: require('./lib/stopwatch/CompositeMixin'),
        StopwatchSection: require('./lib/stopwatch/StopwatchSection'),
    })

};


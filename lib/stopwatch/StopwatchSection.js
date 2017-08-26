/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const CompositeMixin = require('./CompositeMixin');

/**
 * Overwrite StopwatchSection so we can mixin our new CompositeStopwatch
 */
class StopwatchSection extends CompositeMixin(require('@conga/stopwatch').StopwatchSection) {

    // empty

}


module.exports = StopwatchSection;
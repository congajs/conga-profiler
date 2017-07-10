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
const StopwatchSection = require('./StopwatchSection');

/**
 * Overwrite stopwatch, so we can mixin our new CompositeStopwatch
 */
class Stopwatch extends CompositeMixin(require('conga-stopwatch').Stopwatch) {
    /**
     * {@inheritDoc}
     */
    section(name = null) {
        const section = new StopwatchSection(name);
        this.sections.push(section);
        return section;
    }
}

module.exports = Stopwatch;
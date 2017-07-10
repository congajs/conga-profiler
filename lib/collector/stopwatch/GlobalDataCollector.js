/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const DataCollector = require('./DataCollector');
const Stopwatch = require('./../../stopwatch/Stopwatch');

/**
 * The stopwatch data collector service
 */
class GlobalDataCollector extends DataCollector {
    /**
     * {@inheritDoc}
     */
    getName() {
        return 'Stopwatch Global';
    }

    /**
     * {@inheritDoc}
     */
    hasDashboard() {
        return false;
    }
}

module.exports = GlobalDataCollector;
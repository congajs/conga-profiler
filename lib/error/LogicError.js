/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const ProfilerError = require('./ProfilerError');

/**
 * The LogicError class is used for all logic exceptions
 *
 * @Rest:Object
 */
class LogicError extends ProfilerError {
    /**
     * {@inheritDoc}
     */
    constructor(msg = 'Logic Error', previous = null) {
        super(msg, previous);
    }

    /**
     * {@inheritdoc}
     *
     * @Rest:SerializeMethod
     */
    toJSON() {
        return super.toJSON();
    }
}

module.exports = LogicError;
/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// framework libs
const AuthToken = require('@conga/framework-security').Token.AuthToken;

/**
 * The ProfilerAuthToken is the authenticated used for all requests to the backend profiler
 */
class ProfilerAuthToken extends AuthToken {

    // empty

}

module.exports = ProfilerAuthToken;
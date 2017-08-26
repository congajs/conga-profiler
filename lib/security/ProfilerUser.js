/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// framework libs
const AuthUser = require('@conga/framework-security').User.AuthUser;

/**
 * The ProfilerUser is used for authenticated requests into the backend profiler dashboard
 */
class ProfilerUser extends AuthUser {
    /**
     * {@inheritDoc}
     */
    constructor(username = 'anon.', password = null, roles = []) {
        if (roles.indexOf('ROLE_PROFILER') === -1) {
            roles.push('ROLE_PROFILER');
        }
        super(username, password, roles);
    }
}

module.exports = ProfilerUser;
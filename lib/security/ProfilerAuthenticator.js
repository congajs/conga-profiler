/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const ProfilerAuthToken = require('./ProfilerAuthToken');

// framework libs
const { Authenticator, Error } = require('conga-security');

/**
 * The ProfilerAuthenticator is used to grant access into the backend profiler dashboard
 */
class ProfilerAuthenticator extends Authenticator.AbstractAuthenticator {
    /**
     * @param {Object} container The service container
     */
    constructor(container) {
        super();

        // save the container on this instance
        this.container = container;

        // know if a valid authenticator is configured
        this._authenticator = null;
    }

    /**
     * Get the configured authenticator (if any)
     * @returns {Authenticator.AbstractAuthenticator|*|null}
     * @private
     */
    _getAuthenticator() {
        if (this._authenticator) {
            return this._authenticator;
        }

        const config = this.container.get('config');
        const profilerConfig = config.get('profiler');
        const securityConfig = config.get('security');

        if (profilerConfig instanceof Object &&
            profilerConfig.security instanceof Object &&
            typeof profilerConfig.security.authenticator === 'string'
        ) {
            let key = profilerConfig.security.authenticator;

            // see if the configured authenticator is referencing a global security authenticator by name
            if (securityConfig instanceof Object &&
                securityConfig.authenticators instanceof Object &&
                key in securityConfig.authenticators
            ) {
                key = securityConfig.authenticators[ key ];
            }

            // if the configured authenticator has an '@' as the first char, it's a service id
            if (key.charAt(0) === '@') {
                let serviceId = key.replace(/^@/, '');
                if (this.container.has(serviceId)) {
                    let service = this.container.get(serviceId);
                    if (service instanceof Authenticator.AbstractAuthenticator) {
                        this._authenticator = service;
                    } else {
                        throw new Error.ConfigurationError(
                            'The configured authenticator service does not inherit from ' +
                            'conga-security:security/authenticator/AbstractAuthenticator');
                    }
                } else {
                    throw new Error.ConfigurationError('Invalid service id referenced for a profiler authenticator.');
                }
            }
        }

        return this._authenticator;
    }

    /**
     * {@inheritDoc}
     */
    createToken(request, realm = 'Conga Profiler') {
        // validate the query string params
        //if (request.query._access === undefined) {
            //return Promise.reject(new Error.AccessDeniedError('Unauthorized', 401));
        //}

        // make sure the access token is valid
        //if (!this.container.get('profiler.dashboard').isAccessToken(request.query._access)) {
            //return Promise.reject(new Error.AccessDeniedError());
        //}

        // if a valid authenticator has been configured, use it
        const authenticator = this._getAuthenticator();
        if (authenticator instanceof Authenticator.AbstractAuthenticator) {
           return authenticator.createToken(request, realm);
        }

        // resolve a ProfilerAuthToken
        return Promise.resolve(new ProfilerAuthToken(realm));
    }

    /**
     * {@inheritDoc}
     */
    supportsToken(token, realm) {
        const authenticator = this._getAuthenticator();
        if (authenticator instanceof Authenticator.AbstractAuthenticator) {
            return authenticator.supportsToken(token, realm);
        }
        return token instanceof ProfilerAuthToken &&
               token.realm === realm;
    }

    /**
     * {@inheritDoc}
     */
    refreshToken(token, realm) {
        const authenticator = this._getAuthenticator();
        if (authenticator instanceof Authenticator.AbstractAuthenticator) {
            return authenticator.refreshToken(token, realm);
        }
        return super.refreshToken(token, realm);
    }

    /**
     * {@inheritDoc}
     */
    authenticateToken(token, provider, realm) {
        const authenticator = this._getAuthenticator();
        if (authenticator instanceof Authenticator.AbstractAuthenticator) {
            return authenticator.authenticateToken(token, provider, realm);
        }
        return super.authenticateToken(token, provider, realm);
    }
}

module.exports = ProfilerAuthenticator;
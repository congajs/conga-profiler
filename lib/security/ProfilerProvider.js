/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local libs
const ProfilerUser = require('./ProfilerUser');

// framework libs
const AbstractProvider = require('@conga/framework-security').Provider.AbstractProvider;

/**
 * The ProfilerProvider provides an auth resource for authentication / access into the profiler
 * backend dashboard
 */
class ProfilerProvider extends AbstractProvider {
    /**
     * @param {Object} container The service container
     */
    constructor(container) {
        super(null);

        this.container = container;

        // know if a valid provider is configured
        this._provider = null;
    }

    /**
     * Get the configured provider (if any)
     * @returns {AbstractProvider|ChainProvider|InMemoryProvider|BassProvider|null|*}
     * @private
     */
    _getProvider() {
        if (this._provider) {
            return this._provider;
        }

        const config = this.container.get('config');
        const profilerConfig = config.get('profiler');
        const securityConfig = config.get('security');

        if (profilerConfig instanceof Object &&
            profilerConfig.security instanceof Object &&
            profilerConfig.security.provider !== undefined
        ) {
            let customConfig = profilerConfig.security.provider;

            if (typeof customConfig === 'string') {
                if (securityConfig instanceof Object &&
                    securityConfig.providers instanceof Object &&
                    customConfig in securityConfig.providers
                ) {
                    customConfig = securityConfig.providers[ customConfig ];
                }
            }

            let provider = this.container.get('security.firewall.provider.factory')
                .getProviderFromConfig(customConfig);

            if (provider) {
                this._provider = provider;
            }
        }

        return this._provider;
    }

    /**
     * {@inheritDoc}
     */
    supportsResource(resource) {
        const provider = this._getProvider();
        if (provider) {
            return provider.supportsResource(resource);
        }
        return resource instanceof ProfilerUser;
    }

    /**
     * {@inheritDoc}
     */
    getResource(credentials) {
        const provider = this._getProvider();
        if (provider) {
            return provider.getResource(credentials);
        }
        return Promise.resolve(new ProfilerUser());
    }

    /**
     * {@inheritDoc}
     */
    refreshResource(resource) {
        const provider = this._getProvider();
        if (provider) {
            return provider.refreshResource(resource);
        }
        return resource;
    }
}

module.exports = ProfilerProvider;
/**
 * Keep track of access tokens (controls access to the dashboard)
 * @type {Object}
 */

// core libs
const crypto = require('crypto');

/**
 * The max stale lifetime of an access token, in milliseconds
 * @type {number}
 */
const MAX_STALE_LIFETIME = (3600 * 2) * 1000;   // 2 hours

/**
 * The DashboardService helps with Dashboard and controls access tokens
 */
class DashboardService {
    /**
     * @param {Container} container The service container
     */
    constructor(container) {
        this.container = container;
        this.profiler = container.get('profiler');
        this.collectorTags = container.getTagsByName('profiler.data_collector');
    }

    /**
     * Generate an access token for access into the profiler dashboard
     * @returns {Promise}
     */
    generateAccessToken() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(256, (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }
                const expiresAt = new Date();
                expiresAt.setTime(expiresAt.getTime() + MAX_STALE_LIFETIME);
                const manager = this.profiler.getStorageManager();
                const document = manager.createDocument('AccessToken', {token: buffer.toString('hex'), expiresAt});
                manager.persist(document);
                manager.flush(document);
                resolve(document);
            });
            if (Math.random() * 2 > 1) {
                this.removeExpiredAccessTokens();
            }
        });
    }

    /**
     * Remove expired access tokens
     * @returns {Promise}
     */
    removeExpiredAccessTokens() {
        return this.profiler.getStorageManager().removeBy('AccessToken', {expiresAt: {lte: new Date()}});
    }

    /**
     * See if a token is a valid access token
     * @param {String} token The string to check for
     * @returns {boolean}
     */
    isAccessToken(token) {
        const manager = this.profiler.getStorageManager();
        return manager.findOneBy('AccessToken', { token }).then(document => {
            if (!document) {
                return Promise.resolve(false);
            }
            let bool = true;
            const now = (new Date()).getTime();
            if (now >= document.expiresAt.getTime()) {
                // the token is expired
                manager.remove(document);
                bool = false;
            }
            if (bool) {
                document.expiresAt.setTime(now + MAX_STALE_LIFETIME);
            }
            manager.flush(document);
            return Promise.resolve(bool);
        });
    }

    /**
     * Get a data collector by its name
     * @param {String} name The name of the data collector
     * @returns {DataCollectorInterface|null}
     */
    getCollector(name) {
        for (let tag of this.collectorTags) {
            let collector = this.container.get(tag.getServiceId());
            if (collector.getName() === name) {
                return collector;
            }
        }
        return null;
    }
}

module.exports = DashboardService;
/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @Bass:Document(collection="access_tokens")
 * @Rest:Object(type="profiler.model.process_stats")
 */
class AccessToken {
    constructor() {
        /**
         * @Bass:Id
         * @Bass:Field(type="ObjectID", name="_id")
         * @Rest:ID
         */
        this.id = null;

        /**
         * @Bass:Field(type="String", name="token")
         * @Rest:Attribute
         */
        this.token = null;

        /**
         * @Bass:Field(type="Date", name="expires_at")
         * @Rest:Attribute
         */
        this.expiresAt = null;

        /**
         * @Bass:Version
         * @Bass:Field(type="Number", name="version")
         * @Rest:Attribute
         */
        this.version = 0;

        /**
         * @Bass:UpdatedAt
         * @Bass:Field(type="Date", name="updated_at")
         * @Rest:Attribute
         */
        this.updatedAt = null;

        /**
         * @Bass:CreatedAt
         * @Bass:Field(type="Date", name="created_at")
         * @Rest:Attribute
         */
        this.createdAt = null;
    }
}

module.exports = AccessToken;
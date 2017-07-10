/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @Bass:Document(collection="profiler_requests")
 * @Rest:Object(type="profiler.model.requests")
 */
class Request {
    constructor() {
        /**
         * @Bass:Id
         * @Bass:Field(type="ObjectID", name="_id")
         * @Rest:ID
         */
        this.id = null;

        /**
         * @Bass:Field(type="Number", name="pid")
         * @Rest:Attribute
         */
        this.pid = null;

        /**
         * @Bass:Field(type="String", name="profiler_id")
         * @Rest:Attribute
         */
        this.profilerId = null;

        /**
         * @Bass:Field(type="Object", name="request")
         * @Rest:Attribute
         */
        this.request = null;

        /**
         * @Bass:Field(type="Object", name="response")
         * @Rest:Attribute
         */
        this.response = null;

        /**
         * @Bass:Field(type="String", name="path")
         * @Rest:Attribute
         */
        this.path = null;

        /**
         * @Bass:Field(type="Boolean", name="is_xhr")
         * @Rest:Attribute
         */
        this.isXhr = false;

        /**
         * @Bass:Field(type="Object", name="collected")
         * @Rest:Attribute
         */
        this.collectedData = {};

        /**
         * @Bass:EmbedMany(document="ProcessStat", name="stats")
         * @Rest:Attribute
         */
        this.stats = [];

        /**
         * @Bass:Field(type="Number", name="active_req")
         * @Rest:Attribute
         */
        this.activeRequests = 0;

        /**
         * @Bass:Field(type="Number", name="req_time");
         * @Rest:Attribute
         */
        this.requestTime = 0;

        /**
         * @Bass:Field(type="Object", name="auth_token")
         * @Rest:Attribute
         */
        this.authToken = null;

        /**
         * @Bass:Field(type="Number", name="started_at")
         * @Rest:Attribute
         */
        this.startedAt = 0;

        /**
         * @Bass:Field(type="Number", name="finished_at")
         * @Rest:Attribute
         */
        this.finishedAt = 0;

        /**
         * @Bass:Field(type="Date", name="created_at")
         * @Rest:Attribute
         */
        this.createdAt = null;
    }
}

module.exports = Request;
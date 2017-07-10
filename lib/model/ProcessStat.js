/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @Bass:Document(collection="process_stats")
 * @Bass:EmbeddedDocument
 * @Rest:Object(type="profiler.model.process_stats")
 */
class ProcessStat {
    constructor() {
        /**
         * @Bass:Id
         * @Bass:Field(type="ObjectID", name="_id")
         * @Rest:ID
         */
        this.id = null;

        /**
         * @Bass:Field(type="Number", name="pid")
         */
        this.pid = null;

        /**
         * @Bass:Field(type="Number", name="active_req")
         * @Rest:Attribute
         */
        this.activeRequests = 0;

        /**
         * @Bass:Field(type="Number", name="max_active_req")
         * @Rest:Attribute
         */
        this.maxActiveRequests = 0;

        /**
         * @Bass:Field(type="Number", name="mean_req_time")
         * @Rest:Attribute
         */
        this.meanRequestTime = 0;

        /**
         * @Bass:Field(type="Number", name="avg_req_time")
         * @Rest:Attribute
         */
        this.avgRequestTime = 0;

        /**
         * @Bass:Field(type="Number", name="max_req_time")
         * @Rest:Attribute
         */
        this.maxRequestTime = 0;

        /**
         * @Bass:Field(type="Number", name="req_per_sec")
         * @Rest:Attribute
         */
        this.requestPerSec = 0;

        /**
         * @Bass:Field(type="Number", name="cpu")
         * @Rest:Attribute
         */
        this.cpu = null;

        /**
         * @Bass:Field(type="Number", name="avg_cpu")
         * @Rest:Attribute
         */
        this.avgCpu = null;

        /**
         * @Bass:Field(type="Number", name="mean_cpu")
         * @Rest:Attribute
         */
        this.meanCpu = null;

        /**
         * @Bass:Field(type="Number", name="max_cpu")
         * @Rest:Attribute
         */
        this.maxCpu = null;

        /**
         * @Bass:Field(type="Number", name="cpu_usage")
         * @Rest:Attribute
         */
        this.cpuUsage = null;

        /**
         * @Bass:Field(type="Number", name="memory")
         * @Rest:Attribute
         */
        this.memory = null;

        /**
         * @Bass:Field(type="Number", name="avg_memory")
         * @Rest:Attribute
         */
        this.avgMemory = null;

        /**
         * @Bass:Field(type="Number", name="mean_memory")
         * @Rest:Attribute
         */
        this.meanMemory = null;

        /**
         * @Bass:Field(type="Number", name="max_memory")
         * @Rest:Attribute
         */
        this.maxMemory = null;

        /**
         * @Bass:Field(type="Array", name="load_avg")
         * @Rest:Attribute
         */
        this.loadAvg = null;

        /**
         * @Bass:Field(type="Number", name="iterations_since_gc")
         * @Rest:Attribute
         */
        this.iterationsSinceGC = 0;

        /**
         * @Bass:Field(type="Number", name="interval_speed")
         * @Rest:Attribute
         */
        this.intervalSpeed = 0;

        /**
         * @Bass:Field(type="Number", name="microtime")
         * @Rest:Attribute
         */
        this.microtime = 0;

        /**
         * @Bass:Field(type="Date", name="created_at")
         * @Rest:Attribute
         */
        this.createdAt = null;
    }
}

module.exports = ProcessStat;
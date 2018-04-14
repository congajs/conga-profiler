import Vue from 'vue';

import HttpService from './HttpService';

export default Vue.extend({

    template: `
        <div>

            <div class="columns">
                <box class="column">
                    <span slot="header">Request Time</span>
                    <span slot="body">
                        {{ (request.requestTime / 1000 / 1000).toFixed(3) }} seconds
                    </span>
                </box>
                <box class="column">
                    <span slot="header">Active Requests</span>
                    <span slot="body">
                        {{ new Intl.NumberFormat().format(request.activeRequests) }} active
                    </span>
                </box>                
                <box class="column">
                    <span slot="header">Authenticated</span>
                    <span slot="body">
                        <span v-if="request.authToken && request.authToken.authenticated">
                            <span v-if="request.authToken.resource instanceof Object">
                                {{ request.authToken.resource.username }}
                            </span>
                            <span v-else>{{ request.authToken.resource }}</span>
                        </span>
                        <span v-else-if="request.authToken && request.authToken.anonymous">anon.</span>
                        <span v-else>No</span>
                    </span>
                </box>
                <box class="column" v-if="request.firewall">
                    <span slot="header">Firewall</span>
                    <span slot="body">
                        <span v-if="request.firewall.realm">{{ request.firewall.realm }}</span>
                        <span v-else-if="request.firewall.__key">{{ request.firewall.__key }}</span>
                    </span>
                </box>
            </div>
            
            <div style="padding-bottom: 30px;">

                <!-- warning status -->

                <div v-if="requestData.protocol !== 'https'">
                    <span class="icon has-text-danger">
                        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                    </span>
                    No SSL
                </div>

                <div v-if="request.authToken && request.authToken.anonymous">
                    <span class="icon has-text-warning">
                        <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                    </span>
                    Anonymous User
                </div>
            
                <!-- good status -->

                <div v-if="request.authToken && request.authToken.authenticated">
                    <span class="icon has-text-success">
                        <i class="fa fa-check" aria-hidden="true"></i>
                    </span>
                    Authenticated User
                </div>

                <div v-if="request.firewall">
                    <span class="icon has-text-success">
                        <i class="fa fa-check" aria-hidden="true"></i>
                    </span> 
                    Has Firewall
                </div>

                <div v-if="requestData.protocol === 'https'">
                    <span class="icon has-text-success">
                        <i class="fa fa-check" aria-hidden="true"></i>
                    </span>
                    SSL
                </div>

                <div v-if="request.firewall">
                    <span class="icon has-text-success">
                        <i class="fa fa-check" aria-hidden="true"></i>
                    </span>
                    <span v-if="request.firewall.stateless">Stateless</span>
                    <span v-else>Has State</span>
                </div>

                <div v-if="requestData.isXhr">
                    <span class="icon has-text-success">
                        <i class="fa fa-check" aria-hidden="true"></i>
                    </span> 
                    XHR Request
                </div>
            </div>
            
            <box v-if="responseData.error"> 
                <span slot="body">
                    <h1>
                        <span class="icon has-text-danger">
                            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
                        </span> 
                        {{ responseData.error.data.message }}
                    </h1> 
                    <pre>{{ responseData.error.data.stack }}</pre>
                    <div v-if="hasOriginalError() && originalError.previous.stack"> 
                        <pre>{{ originalError.previous.stack }}</pre>
                    </div>
                </span>
            </box>
            
            <box>
                <span slot="header">Request Headers</span>
                <span slot="body">
                    <table>
                        <thead>
                            <tr>
                                <th>Header</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(value, header) in requestData.headers" :key="header">
                                <td style="white-space: nowrap">{{ header }}</td>
                                <td style="word-break: break-all">{{ value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </span>
            </box>

            <box>
                <span slot="header">Response Headers</span>
                <span slot="body">
                    <table>
                        <thead>
                            <tr>
                                <th>Header</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(value, header) in responseData.headers" :key="header">
                                <td style="white-space: nowrap">{{ header }}</td>
                                <td style="word-break: break-all">{{ value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </span>
            </box>

        </div>
    `,

    props: ['id', 'request'],

    computed: {
        requestData: function() {
            return this.request.request;
        },
        responseData: function() {
            return this.request.response;
        },
        originalError: function() {
            return this.request.request.error.data.originalError;
        }
    },

    methods: {
        hasError: function() {
            return this.request.request.error;
        },
        hasOriginalError: function() {
            return this.hasError() && this.request.request.error.data.originalError;
        }
    }
});

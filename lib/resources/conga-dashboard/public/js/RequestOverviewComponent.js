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
                            {{ authenticatedUserName }}
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
            
            <box v-if="responseData.error" v-for="error of getResponseErrors()"> 
                <span slot="body">
                    <h1>
                        <span class="icon has-text-danger">
                            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
                        </span> 
                        {{ error.message }}
                    </h1> 
                    <pre v-if="error.stack">{{ error.stack }}</pre>
                    <pre v-else>{{ serializedResponseError(error) }}</pre>
                    <div v-if="hasOriginalErrorStack(error)"> 
                        <pre>{{ getOriginalErrorStack(error) }}</pre>
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

    props: ['id', 'request', 'requestData', 'responseData'],

    computed: {
        authenticatedUserName: function() {
            const resource = this.request.authToken.resource;
            if (typeof resource === 'object') {
                // try to guess the name
                if (typeof resource.username === 'string') {
                    return resource.username;
                }
                if (typeof resource.userName === 'string') {
                    return resource.userName;
                }
                if (typeof resource.email === 'string') {
                    return resource.email;
                }
                if (typeof resource.login === 'string') {
                    return resource.login;
                }
                if (typeof resource.fullName === 'string') {
                    return resource.fullName;
                }
                if (typeof resource.firstName === 'string') {
                    return resource.firstName + (resource.lastName ? ' ' + resource.lastName : '');
                }
                if (typeof resource.name === 'string') {
                    return resource.name;
                }
                if (typeof resource.title === 'string') {
                    return resource.title;
                }
                return this.request.authToken.login;
            }
            return resource;
        }
    },

    methods: {
        serializedResponseError: function(error) {
            if (!error) {
                error = this.request.response.error;
            }
            return JSON.stringify(error, null, 4);
        },
        hasError: function() {
            return this.request.request.error;
        },
        getResponseErrors: function() {
            const response = this.request.response;
            let errors = [];
            if (!response.error) {
                return errors;
            }
            if (typeof response.error.data === 'string') {
                errors.push({
                    message: response.error.data
                });
                return errors;
            }
            if (!response.error.data) {
                if (response.error.message) {
                    errors.push({
                        message: response.error.message,
                        stack: response.error.stack
                    });
                }
            }
            if (Array.isArray(response.error.data.errors)) {
                for (const err of response.error.data.errors) {
                    if (err.message || err.stack) {
                        errors.push({
                            message: err.message,
                            stack: err.stack,
                            data: err.data && Object.create(err.data)
                        });
                    } else if (typeof err.data === 'object') {
                        errors.push({
                            message: err.data.message,
                            stack: err.data.stack,
                            data: Object.create(err.data)
                        });
                    } else if (typeof err.data === 'string') {
                        errors.push({
                            message: err.data
                        });
                    }
                }
            }
            if (errors.length === 0) {
                if (response.error.message) {
                    errors.push({
                        message: response.error.message,
                        stack: response.error.stack
                    });
                } else if (response.error.data.message) {
                    errors.push({
                        message: response.error.data.message,
                        stack: response.error.data.stack
                    });
                }
            }
            if (errors.length === 0) {
                errors.push(response.error);
            }
            return errors;
        },
        getOriginalError: function(error) {
            if (!error) {
                error = this.request.response.error;
            }
            return error && error.data && error.data.originalError;
        },
        hasOriginalError: function(error) {
            if (!error) {
                error = this.request.response.error;
            }
            return error && error.data && error.data.originalError;
        },
        getOriginalErrorStack: function(error) {
            const err = this.getOriginalError(error);
            return err && err.previous && err.previous.stack;
        },
        hasOriginalErrorStack: function(error) {
            return !!this.getOriginalErrorStack(error);
        }
    }
});

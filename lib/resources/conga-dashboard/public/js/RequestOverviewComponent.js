import Vue from 'vue';

export default Vue.extend({

    template: `

        <div v-if="request !== null">
            
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

                <div v-if="request.request.protocol !== 'https'">
                    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                    No SSL
                </div>

                <div v-if="request.authToken && request.authToken.anonymous">
                    <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                    Anonymous User
                </div>
            
                <!-- good status -->

                <div v-if="request.authToken && request.authToken.authenticated">
                    <i class="fa fa-check" aria-hidden="true"></i>
                    Authenticated User
                </div>

                <div v-if="request.firewall">
                    <i class="fa fa-check" aria-hidden="true"></i> Has Firewall
                </div>

                <div v-if="request.request.protocol === 'https'">
                    <i class="fa fa-check" aria-hidden="true"></i> SSL
                </div>

                <div v-if="request.firewall">
                    <i class="fa fa-check" aria-hidden="true"></i>
                    <span v-if="request.firewall.stateless">Stateless</span>
                    <span v-else>Has State</span>
                </div>

                <div v-if="request.request.isXhr">
                    <i class="fa fa-check" aria-hidden="true"></i> XHR Request
                </div>
            </div>
            
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
                            <tr v-for="(value, header) in request.request.headers" :key="header">
                                <td style="white-space: nowrap">{{ header }}</td>
                                <td>{{ value }}</td>
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
                            <tr v-for="(value, header) in request.response.headers" :key="header">
                                <td style="white-space: nowrap">{{ header }}</td>
                                <td>{{ value }}</td>
                            </tr>
                        </tbody>
                    </table>
                </span>
            </box>

        </div>

    `,

    props: ['id'],

    data: function() {
        return {
            request: null
        }
    },

    created: function() {
        this.$http.get('_conga/profiler/request/' + this.id).then((response) => {
            this.request = response.body.request;
        }, (response) => {

        });
    }
});

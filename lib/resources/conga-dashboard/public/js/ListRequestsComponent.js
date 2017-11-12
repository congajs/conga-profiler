import Vue from 'vue';

import RequestStatusMapper from './RequestStatusMapper';

export default Vue.extend({

    template: `

        <div>

            <hero>

                <span slot="hero-title">Profiler</span>
                <span slot="hero-subtitle">@conga/framework-profiler</span>

                <div class="container" slot="hero-foot">

                    <div class="tabs is-boxed">
                        <ul>
                            <li class="is-active"><a>Request History</a></li>

                        </ul>
                    </div>

                </div>

            </hero>

            <main-section>

                <article class="message is-primary">
                    <div class="message-body">
                        These are the requests captured by the profiler.
                    </div>
                </article>


                    <div class="field has-addons is-pulled-right">
                      <div class="control">
                        <input class="input" type="text" placeholder="search by url, status, xhr, datetime">
                      </div>
                      <div class="control">
                        <a class="button">
                            <span class="icon is-small is-left">
                               <i class="fa fa-search"></i>
                             </span>
                        </a>
                      </div>
                    </div>

                    <table class="table is-striped is-narrow is-fullwidth" style="font-size: 11px;">
                        <thead>
                            <tr>
                                <th>PID</th>
                                <th>Status</th>
                                <th>Host</th>
                                <th>Path</th>
                                <th>IP Address</th>
                                <th>XHR</th>
                                <th>Active Requests</th>
                                <th>Created At</th>
                                <th>Request Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in requests" v-on:click="open(data.profilerId)">
                                <td>{{ data.pid }}</td>
                                <td>
                                    <span v-bind:class="['tag', statusMapper(data.response.statusCode)]">
                                        {{ data.response.statusCode }}
                                    </span>
                                </td>
                                <td>{{ data.request.headers.host }}</td>
                                <td>{{ data.request.originalUrl }}</td>
                                <td>{{ data.request.ip }}</td>
                                <td>{{ data.request.xhr ? 'XHR' : 'NO' }}</td>
                                <td>{{ data.activeRequests }}</td>
                                <td>
                                    {{ data.createdAt | moment('H:mm:ss') }}
                                    @{{ data.createdAt | moment('SSS') }}ms
                                </td>
                                <td>
                                    {{ ((data.finishedAt - data.startedAt) / 1000 / 1000).toFixed(3) }} seconds
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <nav class="pagination is-small" role="navigation" aria-label="pagination">
                      <a class="pagination-previous">Previous</a>
                      <a class="pagination-next">Next page</a>
                      <ul class="pagination-list">
                        <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
                        <li><span class="pagination-ellipsis">&hellip;</span></li>
                        <li><a class="pagination-link" aria-label="Goto page 45">45</a></li>
                        <li><a class="pagination-link is-current" aria-label="Page 46" aria-current="page">46</a></li>
                        <li><a class="pagination-link" aria-label="Goto page 47">47</a></li>
                        <li><span class="pagination-ellipsis">&hellip;</span></li>
                        <li><a class="pagination-link" aria-label="Goto page 86">86</a></li>
                      </ul>
                    </nav>

            </main-section>

        </div>

    `,


    // <td>{{ data.activeRequests|number_format(0, '.', ',') }}</td>
    // <td>
    //     {{ data.createdAt|date('g:i:sa') }} @
    //     <span class="milliseconds">{{ (data.createdAt|date('u') / 1000)|round(3, 'floor') }}ms</span>
    // </td>
    // <td>
    //     {{ ((data.finishedAt - data.startedAt) / 1000 / 1000)|number_format(3, '.', ',') }} seconds
    // </td>

    data: function() {
        return {
            requests: [],
            statusMapper: RequestStatusMapper.mapStatusToClass
        }
    },

    created: function() {
        this.$http.get('_conga/profiler/requests').then((response) => {
            this.requests = response.body.requests;
        }, (response) => {

        });
    },

    methods: {
        open: function(id) {
            this.$router.push({ name: 'profiler.request', params: { id: id }});
        }
    }

});

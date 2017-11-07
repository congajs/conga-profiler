import Vue from 'vue';

import RequestStatusMapper from './RequestStatusMapper';

export default Vue.extend({

    template: `

        <div>

            <hero v-bind:type="statusClass">

                <span slot="hero-title">
                    {{ request.response.statusCode }} {{ request.response.statusMessage }}
                </span>
                <span slot="hero-subtitle">
                    <strong>{{ request.request.method }}</strong>
                    {{ request.request.protocol }}://{{ request.request.headers.host }}{{ request.path }}
                </span>

                <div class="container" slot="hero-foot">

                    <div class="tabs is-boxed">
                        <ul>
                            <li v-bind:class="{ 'is-active': $route.name === 'profiler.request' }">

                                <router-link class="panel-block":to="{ name: 'profiler.request', params: { id: id }}">
                                    Request Overview
                                </router-link>

                            </li>

                            <li v-bind:class="{ 'is-active': $route.name === 'profiler.request.collector' &&  $route.params.name === name }" v-for="name in navigation" :key="name">
                                <router-link
                                    :to="{ name: 'profiler.request.collector', params: { id: id, name: name }}"
                                >
                                    {{ name }}
                                </router-link>
                            </li>
                        </ul>
                    </div>

                </div>

            </hero>

            <main-section>

                    <div class="content">
                        <router-view></router-view>
                    </div>

                </div>
            </main-section>

        </div>

    `,

    props: ['id'],

    data: function() {
        return {
            request: {},
            navigation: [],
            statusClass: 'is-primary'
        }
    },

    created: function() {
        this.$http.get('_conga/profiler/request/' + this.id).then((response) => {
            this.navigation = response.body.navigation;
            this.request = response.body.request;
            this.statusClass = RequestStatusMapper.mapStatusToClass(response.body.request.response.statusCode);
        }, (response) => {

        });
    }
});
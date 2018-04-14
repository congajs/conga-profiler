import Vue from 'vue';

import RequestStatusMapper from './RequestStatusMapper';

import HttpService from './HttpService';

export default Vue.extend({

    template: `
        <div>

            <hero v-bind:type="statusClass">
            
                <span v-if="request.isLoading" clot="hero-title">Loading request data&hellip;</span>
                <span v-else slot="hero-title">
                    {{ request.response.statusCode }} {{ request.response.statusMessage }}
                </span>
                
                <span v-if="!request.isLoading" slot="hero-subtitle">
                    <strong>{{ request.request.method }}</strong>
                    <a v-bind:href="requestUrl" 
                       v-bind:target="'request_' + request.profilerId">{{ requestUrl }}</a>
                </span>
    
                <div class="container" slot="hero-foot">

                    <div class="tabs is-boxed">
                        <ul>
                            <li v-bind:class="{ 'is-active': $route.name === 'profiler.request' }">

                                <router-link class="panel-block" :to="{ name: 'profiler.request', params: { id: id }}">
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
                <div v-if="request.isLoading" class="content">

                    <p>Loading, please wait&hellip;</p> 

                </div>
                <div v-else class="content">

                    <router-view 
                        v-bind:request="request"
                        v-bind:requestData="requestData"
                        v-bind:responseData="responseData"
                        v-bind:requestUrl="requestUrl"
                    ></router-view>

                </div>
            </main-section>

        </div>
    `,

    props: ['id'],

    computed: {
        requestData: function() {
            return this.request.request;
        },
        responseData: function() {
            return this.request.response;
        },
        requestUrl: function() {
            const requestData = this.request.request;
            return requestData.protocol + '://' + requestData.headers.host + this.request.path;
        }
    },

    data: function() {
        return {
            request: {
                isLoading: true,
                request: {
                    headers: {}
                },
                response: {
                    statusCode: 200
                }
            },
            navigation: [],
            statusClass: 'is-primary'
        }
    },

    created: function() {
        const url = '_conga/profiler/request/' + encodeURIComponent(this.id);
        HttpService.get(this.$http, this.$router, url).then((response) => {
            const { navigation, request, children, parent, token } = response.body;
            this.navigation = navigation;
            this.request = Object.assign({isLoading: false}, request);
            this.statusClass = RequestStatusMapper.mapStatusToClass(this.request.response.statusCode);
            console.log('request overview', this.request);
        }, (response) => {

        });
    }
});

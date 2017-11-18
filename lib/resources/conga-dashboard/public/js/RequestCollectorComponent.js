import Vue from 'vue';

import HttpService from './HttpService';

const getFileName = name => name.toLowerCase().replace(/\s+/g, '-').replace(/-{2}/g, '-');

const collectors = ['bass', 'stopwatch'];

const components = {
    'default': {
        template: '<div>loading</div>'
    }
};

PROFILER_COLLECTORS.forEach((collector) => {
    const name = getFileName(collector);
    const component = require('collectors/' + name + '/Component.js');
    components[name] = component.default;
});

export default Vue.extend({

    components: components,

    template: `

        <div >

            <component :is="currentView" v-bind:d="data" v-bind:request="request">
                <!-- component changes when vm.currentView changes! -->
            </component>

        </div>

    `,

    props: ['id', 'name'],

    data: function() {
        return {
            currentView: 'default',
            data: null,
            request: null
        }
    },

    watch: {

        name: function(name) {

            this.currentView = getFileName(name);

            const url = '_conga/profiler/request/' +
                encodeURIComponent(this.id) + '/' + encodeURIComponent(name);

            HttpService.get(this.$http, this.$router, url).then((response) => {
                this.data = response.body.data;
                this.request = response.body.request;
                console.log(this.data);
            }, (response) => {

            });
        }
    },

    loadData: function() {
        this.currentView = getFileName(this.name);

        const url = '_conga/profiler/request/' +
            encodeURIComponent(this.id) + '/' + encodeURIComponent(this.name);

        HttpService.get(this.$http, this.$router, url).then((response) => {
            this.data = response.body.data;
            this.request = response.body.request;
            console.log(this.data);
        }, (response) => {

        });
    },

    created: function() {

        this.currentView = getFileName(this.name);

        const url = '_conga/profiler/request/' +
            encodeURIComponent(this.id) + '/' + encodeURIComponent(this.name);

        HttpService.get(this.$http, this.$router, url).then((response) => {
            this.data = response.body.data;
            this.request = response.body.request;
            console.log(this.data);
        }, (response) => {

        });
    }
});

import Vue from 'vue';

const collectors = ['bass', 'stopwatch'];

const components = {
    'default': {
        template: '<div>loading</div>'
    }
};

PROFILER_COLLECTORS.forEach((collector) => {
    const component = require('collectors/' + collector + '/Component.js');
    components[collector] = component.default;
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

            this.currentView = name.toLowerCase();

            this.$http.get('_conga/profiler/request/' + this.id + '/' + name).then((response) => {
                this.data = response.body.data;
                this.request = response.body.request;
                console.log(this.data);
            }, (response) => {

            });
        }
    },

    loadData: function() {
        this.currentView = this.name.toLowerCase();

        this.$http.get('_conga/profiler/request/' + this.id + '/' + this.name).then((response) => {
            this.data = response.body.data;
            this.request = response.body.request;
        }, (response) => {

        });

    },

    created: function() {

        this.currentView = this.name.toLowerCase();

        this.$http.get('_conga/profiler/request/' + this.id + '/' + this.name).then((response) => {
            this.data = response.body.data;
            this.request = response.body.request;
        }, (response) => {

        });
    }
});

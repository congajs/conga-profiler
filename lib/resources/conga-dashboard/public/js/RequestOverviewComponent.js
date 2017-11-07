import Vue from 'vue';

export default Vue.extend({

    template: `

        <div v-if="request !== null" class="">

            <h2>
                <span class="status-code">
                    {{ request.response.statusCode }} {{ request.response.statusMessage }}
                </span>
                // {{ request.request.method }}
                <span class="normal">
                    {{ request.request.protocol }}://{{ request.request.headers.host }}{{ request.path }}
                </span>
            </h2>

        </div>

    `,

    props: ['id'],

    data: function() {
        return {
            request: {}
        }
    },

    created: function() {
        this.$http.get('_conga/profiler/request/' + this.id).then((response) => {
            this.request = response.body.request;
        }, (response) => {

        });
    }
});

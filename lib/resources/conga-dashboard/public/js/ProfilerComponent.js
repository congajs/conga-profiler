import Vue from 'vue';

export default Vue.extend({

    template: `

        <div>
            <router-view></router-view>
        </div>

    `,

    data: function() {
        return {
            $route: this.$route
        }
    },

    created: function() {

    }
});

import Vue from 'vue';

import HttpService from './HttpService';

export default Vue.extend({

    template: `

        <div>

            <hero>

                <span slot="hero-title">Profiler</span>
                <span slot="hero-subtitle">@conga/framework-profiler</span>

            </hero>

            <main-section>

                <article class="message is-primary">
                    <div class="message-body">
                        <p style="padding-bottom: 30px;">You must authenticate to access the profiler.</p>
                        
                        <form onsubmit="return false">
                            <div class="field">
                                <label for="username" class="label">Username</label>
                                <div class="control">
                                    <input type="text" id="username" />
                                </div>
                            </div>
                            <div class="field">
                                <label for="password" class="label">Password</label>
                                <div class="control">
                                    <input type="password" id="password" />
                                </div>
                            </div>
                            <div class="field">
                                <div class="control">
                                    <button class="button is-primary" v-on:click="login">Submit</button>
                                </div>
                            </div>                            
                        </form>
                    </div>
                </article>

            </main-section>

        </div>

    `,

    data: function() {
        return {};
    },

    created: function() {

    },

    methods: {
        login: function(evt) {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username.length === 0 || password.length === 0) {
                return;
            }
            HttpService.authenticate(username, password);
            HttpService.route(this.$router);
        }
    }

});

import * as d3 from 'd3';
import Vue from 'vue';
import Stopwatch from './Stopwatch';

import './stopwatch.css';

export default Vue.extend({

    template: `

        <div id="stopwatch"></div>

    `,

    props: ['d', 'request'],

    destroyed: function() {
        d3.select(window).on('resize.stopwatch_timeline', null);
    },

    watch: {

        request: function(request) {

            console.log('updated');
            console.log(this);

            if (request === null) {
                return;
            }

            console.log('made it here');

            let svg;
            const container = document.getElementById('stopwatch');
            const timeline = new Stopwatch([
                request.collectedData['Stopwatch'],
                request.collectedData['Stopwatch Global']
            ]);

            // output the timeline to the console for debug
            console.log('stopwatch timeline', timeline);

            // update the width function to evaluate our layout before we render
            timeline.setConfig({
                fnWidth: function() {
                    return document.getElementById('stopwatch').offsetWidth;
                }
            });

            svg = timeline.render().node();

            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            container.appendChild(svg);

            d3.select(window).on('resize.stopwatch_timeline', evt => {
                svg.remove();
                svg = timeline.render().node();
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                container.appendChild(svg);
            });
        }

    }
});

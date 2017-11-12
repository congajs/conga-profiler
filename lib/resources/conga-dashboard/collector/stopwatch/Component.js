import * as d3 from 'd3';
import Vue from 'vue';
import Stopwatch from './Stopwatch';

import './stopwatch.css';

export default Vue.extend({

    template: `

        <div id="stopwatch"></div>

    `,

    props: ['d', 'request'],

    watch: {

        request: function(request) {

            console.log('updated');
            console.log(this);

            if (request === null) {
                return;
            }

            console.log('made it here');

            var svg;
            var container = document.getElementById('stopwatch');
            var timeline = new Stopwatch([
                request.collectedData['Stopwatch'],
                request.collectedData['Stopwatch Global']
            ]);

            // output the timeline to the console for debug
            console.log('stopwatch timeline', timeline);

            // update the width function to evaluate our layout before we render
            timeline.setConfig({
                fnWidth: function() {
                    //var style = window.getComputedStyle(document.querySelector('#content > .content'));

                    return 900;

                    return document.body.offsetWidth
                            - document.getElementById('sidebar').offsetWidth
                            - parseInt(style && style.getPropertyValue('padding-left') || 0, 10)
                            - parseInt(style && style.getPropertyValue('padding-right') || 0, 10)
                            - parseInt(style && style.getPropertyValue('margin-left') || 0, 10)
                            - parseInt(style && style.getPropertyValue('margin-right') || 0, 10);
                }
            });

            //d3.select(window).on('load.stopwatch_timeline', function(evt) {
                console.log('GOT EVENT');
                svg = timeline.render().node();

                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                container.appendChild(svg);
            //});

            d3.select(window).on('resize.stopwatch_timeline', function(evt) {
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

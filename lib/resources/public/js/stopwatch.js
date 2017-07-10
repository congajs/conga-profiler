// sections get drawn on their own timeline above nested sections and events
// [ section ........ ]
//  [ evt ]
//        [ section . ]
//           [ evt .. ]
//             [ evt  ]
//              [ evt ]


/**
 * This class exists to document the graph data needed for each bar
 * @param {Object} [data] Optional data to initialize with
 * @constructor
 */
function TimelineData(data) {
    // fix object references
    this.periods = [];
    this.firstPeriod = Object.create(TimelineData.PeriodTemplate);
    this.lastPeriod = Object.create(TimelineData.PeriodTemplate);

    var proto = Object.getPrototypeOf(this);
    for (var i in data) {
        if (i in proto) {
            this[i] = data[i];
        }
    }
}

TimelineData.PeriodTemplate = {start:0, end: 0, startedAt: 0, finishedAt: 0};

TimelineData.prototype = {
    constructor: TimelineData,
    id: undefined,
    isSection: false,
    section: undefined,
    name: undefined,
    category: 'default',
    periods: [],
    hasPeriods: false,
    firstPeriod: {start:0, end: 0, startedAt: 0, finishedAt: 0},
    lastPeriod: {start:0, end: 0, startedAt: 0, finishedAt: 0}
};



/**
 * The timeline graph shows a timeline of events as they happened
 * @param {TimelineData} data
 * @constructor
 */
function TimelineGraph(data) {
    this.setData(data);
    this.config = {
        id: 'timeline-graph',
        width: null,
        height: Math.ceil(this.dataLen / TimelineGraph.COUNT_PER_PAGE) * TimelineGraph.HEIGHT_PER_PAGE,
        fnWidth: function() { return this.config.width; }.bind(this),
        fnHeight: function() { return this.config.height; }.bind(this),
        fnOuterHeight: function() {
            return this.config.fnHeight() + this.canvas.offsetHeight + this.canvas.offsetTop;
        }.bind(this),
        timeFormat: TimelineGraph.TIME_FORMAT,
        heightPerPage: TimelineGraph.HEIGHT_PER_PAGE,
        canvasOffsetTop: TimelineGraph.CANVAS_OFFSET_TOP,
        canvasBarHeight: TimelineGraph.CANVAS_BAR_HEIGHT,
        canvasBarWidthMin: TimelineGraph.CANVAS_BAR_WIDTH_MIN,
        canvasLabelOffset: TimelineGraph.CANVAS_LABEL_OFFSET,
        canvasLabelFontSize: TimelineGraph.CANVAS_LABEL_FONT_SIZE,
        canvasLegendWidth: TimelineGraph.CANVAS_LEGEND_WIDTH,
        canvasLegendPadding: TimelineGraph.CANVAS_LEGEND_PADDING,
        canvasLegendSwatchWidth: TimelineGraph.CANVAS_LEGEND_SWATCH_WIDTH,
        canvasLegendSwatchHeight: TimelineGraph.CANVAS_LEGEND_SWATCH_HEIGHT,
        canvasLegendLabelOffsetTop: TimelineGraph.CANVAS_LEGEND_LABEL_OFFSET_TOP,
        canvasLegendLabelOffsetLeft: TimelineGraph.CANVAS_LEGEND_LABEL_OFFSET_LEFT,
        canvasLegendLabelFontSize: TimelineGraph.CANVAS_LEGEND_LABEL_FONT_SIZE,
        canvasStaticColors: TimelineGraph.CANVAS_STATIC_COLORS,
        canvasColors: TimelineGraph.CANVAS_COLORS,
        timeScaleDomain: [
            this.getFirstDataPeriod().startedAt,
            d3.max(this.data, function(d) { return d.lastPeriod.finishedAt; })
        ]
    };
    this.hasCanvas = false;
}

TimelineGraph.COUNT_PER_PAGE = 1;
TimelineGraph.HEIGHT_PER_PAGE = 50;
TimelineGraph.TIME_FORMAT = d3.timeFormat('%-I:%M:%S.%L');
TimelineGraph.CANVAS_OFFSET_TOP = 10;
TimelineGraph.CANVAS_BAR_HEIGHT = 5;
TimelineGraph.CANVAS_BAR_WIDTH_MIN = 2;
TimelineGraph.CANVAS_LABEL_OFFSET = 10;
TimelineGraph.CANVAS_LABEL_FONT_SIZE = 12;
TimelineGraph.CANVAS_LEGEND_WIDTH = 150;
TimelineGraph.CANVAS_LEGEND_PADDING = 10;
TimelineGraph.CANVAS_LEGEND_SWATCH_WIDTH = 15;
TimelineGraph.CANVAS_LEGEND_SWATCH_HEIGHT = 15;
TimelineGraph.CANVAS_LEGEND_LABEL_OFFSET_TOP = 12;
TimelineGraph.CANVAS_LEGEND_LABEL_OFFSET_LEFT = 5;
TimelineGraph.CANVAS_LEGEND_LABEL_FONT_SIZE = 12;
TimelineGraph.CANVAS_STATIC_COLORS = {
    default: '#969696',
    section: '#353535'
};
TimelineGraph.CANVAS_COLORS = [
    '#007DF9', '#B16DF7', '#FF5BD9', '#3CB371', '#832C2C', '#FFB431', '#1DCCF9', '#FF0042', '#CB813A', '#1CFF9E', '#96831b', '#000BFF', '#5D05A9'
];

TimelineGraph.prototype = {
    setData: function(data) {
        this.data = data;
        this.dataLen = this.data.length;
        this.hasData = this.dataLen !== 0;
        this.dataLastIdx = this.dataLen - 1;
    },

    setConfig: function(config) {
        for (var key in config) {
            if (key in this.config && (key.substr(0,2) !== 'fn' || typeof config[key] === 'function')) {
                this.config[key] = config[key];
            }
        }
        return this;
    },

    getFirstDataPeriod: function() {
        return this.hasData && this.data[0].firstPeriod || {};
    },

    getLastDataPeriod: function() {
        return this.hasData && this.data[this.dataLastIdx].lastPeriod || {};
    },

    getTimeScale: function() {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        return d3.scaleTime().domain(this.config.timeScaleDomain).range([0, this.canvas.width]);
    },

    getTimeScaleTicks: function() {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        var duration = this.getLastDataPeriod().end - this.getFirstDataPeriod().start;
        var mill = duration / 1000;
        var offset = 1;
        if (mill >= 20) {
            offset = Math.round(mill / this.canvas.maxTicks);
        }
        return {
            format: d3.timeMillisecond,
            offset: offset
        };
    },

    getHeightScale: function() {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        return d3.scaleLinear().domain([1, this.dataLen]).range([this.canvas.offsetHeight + this.canvas.offsetTop, this.canvas.height]);
    },

    getEventColor: function(event) {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        if (!(event.category in this.canvas.colorMap)) {
            if (event.category in this.config.canvasStaticColors) {
                this.canvas.colorMap[event.category] = this.config.canvasStaticColors[event.category];
            } else {
                this.canvas.colorMap[event.category] = this.config.canvasColors[event.idx % this.config.canvasColors.length];
            }
        }
        return this.canvas.colorMap[event.category];
    },

    calcLeft: function(date, timeScale) {
        return (timeScale || this.getTimeScale())(date);
    },

    calcTop: function(dataIdx, heightScale) {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        return (heightScale || this.getHeightScale())(dataIdx + 1);
    },

    calcBarTop: function(dataIdx, heightScale) {
        return this.calcTop(dataIdx, heightScale) + this.canvas.labelOffset;
    },

    calcWidth: function(startedAt, finishedAt, timeScale) {
        if (!this.hasCanvas) {
            this._initCanvas();
        }
        return Math.max(
            this.canvas.barWidthMin,
            this.calcLeft(finishedAt, timeScale) - this.calcLeft(startedAt, timeScale)
        );
    },

    render: function() {
        if (!this.hasData) {
            return this.renderNoData();
        }

        this._initCanvas();

        var timeScale = this.getTimeScale();
        var timeScaleTicks = this.getTimeScaleTicks();

        this._renderColorLegend();

        var heightScale = this.getHeightScale();

        this._renderBackground(timeScale, timeScaleTicks, heightScale);

        this._renderAxisX(timeScale, timeScaleTicks);

        // bars needs to be last so it's z-index sits on top for the tooltips
        this._renderBars(timeScale, heightScale);

        return this.canvas.svg;
    },

    renderNoData: function() {
        this._initCanvas();

        // TODO: finish

        return this.canvas.svg;
    },

    clear: function() {
        if (this.canvas) {
            if (this.canvas.svg) {
                this.canvas.svg.remove();
            }
            this.canvas = {};
        }
        this.hasCanvas = false;
        return this;
    },

    _initCanvas: function() {
        this.clear();

        this.canvas = {
            svg: d3.select('body').append('svg'),
            width: (this.config.fnWidth() || document.body.offsetWidth),
            height: Math.max(TimelineGraph.HEIGHT_PER_PAGE, this.config.fnHeight()),
            fnOuterHeight: this.config.fnOuterHeight,
            offsetHeight: 0,
            offsetTop: this.config.canvasOffsetTop,
            barHeight: this.config.canvasBarHeight,
            barWidthMin: this.config.canvasBarWidthMin,
            labelOffset: this.config.canvasLabelOffset,
            labelFontSize: this.config.canvasLabelFontSize,
            legend: {
                width: this.config.canvasLegendWidth,
                padding: this.config.canvasLegendPadding,
                swatch: {
                    width: this.config.canvasLegendSwatchWidth,
                    height: this.config.canvasLegendSwatchHeight
                },
                label: {
                    offsetTop: this.config.canvasLegendLabelOffsetTop,
                    offsetLeft: this.config.canvasLegendLabelOffsetLeft,
                    fontSize: this.config.canvasLegendLabelFontSize
                }
            },
            colorMap: {}
        };

        this.canvas.maxTicks = this.canvas.width > 1000 ? 30 : 20;

        this.canvas.svg
            .attr('id', this.config.id)
            .attr('width', this.canvas.width)
            .attr('height', this.canvas.fnOuterHeight());

        this.hasCanvas = true;

        return this;
    },

    _renderBackground: function(timeScale, ticks, heightScale) {
        // render section backgrounds
        this._renderSectionBackgrounds(timeScale, heightScale);

        // render the time-scale grid (vertical lines)
        this._renderGrid(timeScale, ticks);

        return this;
    },

    _renderSectionBackgrounds: function(timeScale, heightScale) {
        var self = this;

        this.canvas.svg.append('g').attr('class', 'section-background').selectAll('rect')
            .data(this.data.reduce(function(sections, data) {
                if (data.isSection) {
                    // find the last event in this section
                    if (!data.lastSectionEvent) {
                        data.lastSectionEvent = self.data.reduce(function(evt, d) {
                            if (!d.isSection &&
                                (data.section === d.section || data.lastPeriod.end >= d.lastPeriod.end)
                            ) {
                                return d;
                            }
                            return evt;
                        }, null);
                    }
                    sections.push(data);
                }
                return sections;
            }, []))
            .enter()
            .append('rect')
            .attr('class', 'section-bg')
            .attr('x', function(d) { return self.calcLeft(d.firstPeriod.startedAt, timeScale); })
            .attr('y',function(d) { return self.calcBarTop(d.idx, heightScale); })
            .attr('height', function(d) {
                // section height = event.top - top + barHeight
                return Math.abs(
                    self.calcBarTop(d.lastSectionEvent && d.lastSectionEvent.idx, heightScale) - self.calcBarTop(d.idx, heightScale)
                ) + self.canvas.barHeight;
            })
            .attr('width', function(d) {
                return self.calcWidth(d.firstPeriod.startedAt, d.lastPeriod.finishedAt, timeScale);
            });

        return this;
    },

    _renderBars: function(timeScale, heightScale) {

        var self = this;

        this.canvas.svg
            .append('g').attr('class', 'bars').selectAll('g.bar-group').data(this.data).enter()
            .append('g')
            .attr('class', function(d) {
                return 'bar-group ' + d.category + (d.isSection ? 'section' : 'event');
            })
            .each(function(d) {

                var title;

                // add the text label to the bar-group
                var text = d3.select(this).selectAll('text').data([d]).enter()
                    .append('text')
                    .attr('font-size', self.canvas.labelFontSize)
                    .text(function(d) {
                        // TODO: configure the label with a callback fn
                        var mem, mbStr = '';
                        var dTime, timeStr = '';
                        var name = d.isSection ? d.section : d.name;
                        if (d.periods && d.periods.length !== 0) {
                            dTime = d.lastPeriod.end / 1000 - d.firstPeriod.start / 1000;
                            timeStr = '~ ' + dTime.toFixed(3) + ' ms';
                            mem = d.firstPeriod.memory;
                            mbStr = '~ ';
                            mbStr += (mem.rss / 1024 / 1024).toFixed(3) + ' MB';
                            //mbStr += (mem.heapTotal / 1024 / 1024) + 'MB, ';
                            //mbStr += (mem.heapUsed / 1024 / 1024) + 'MB';
                            mbStr += ' ';
                        }
                        title = name + ' ' + timeStr + ' / ' + mbStr;
                        return title;
                    })
                    .attr('y', function(d) { return self.calcTop(d.idx, heightScale); })
                    .attr('x', function(d) {
                        var x = self.calcLeft(d.firstPeriod.startedAt, timeScale);
                        try {
                            var bounds = this.getBBox();
                            if (x + bounds.width > self.canvas.width) {
                                x = self.canvas.width - bounds.width;
                            }
                        } catch(e) {
                            // firefox throws NS_ERROR_NOT_IMPLEMENTED ??
                        }
                        return x;
                    });

                // add the bar (rect) to the bar-group
                d3.select(this).selectAll('rect').data([d]).enter()
                    .append('rect')
                    .attr('data-category', function(d) { return d.category; })
                    .attr('data-section', function(d) { return d.section; })
                    .attr('fill', function(d) { return self.getEventColor(d); })
                    .attr('x', function(d) { return self.calcLeft(d.firstPeriod.startedAt, timeScale); })
                    .attr('y',function(d) { return self.calcBarTop(d.idx, heightScale); })
                    .attr('height', self.canvas.barHeight)
                    .attr('width', function(d) {
                        return self.calcWidth(d.firstPeriod.startedAt, d.lastPeriod.finishedAt, timeScale);
                    });

                d3.select(this).append('title').text(title);
            });

        return this;
    },

    _renderColorLegend: function() {

        var self = this;

        var colorMap = this.data.reduce(function(map, data) {
            if (data.category && !(data.category in map)) {
                map[data.category] = {
                    event: data,
                    color: self.getEventColor(data)
                };
            }
            return map;
        }, {});

        var rect,
            text,
            idx = 0,
            config = this.canvas.legend,
            categories = Object.keys(colorMap),
            colorsPerLine = Math.floor(this.canvas.width / config.width),
            numLines = Math.max(1, Math.ceil(categories.length / colorsPerLine));

        var root = this.canvas.svg.append('g').attr('class', 'color-legend');

        // add a group for each color swatch
        var renderColorLegend = function(idx, category, event) {
            var left = idx % colorsPerLine * (config.width + config.padding);
            var line = Math.max(1, Math.ceil((idx + 1) / colorsPerLine));
            var top = (line - 1) * (config.swatch.height + config.padding);

            // make the item-group
            var group = root.append('g')
                .datum(event)
                .attr('data-category', category)
                .attr('class', 'color-legend-item');

            // append the color swatch to the item group
            group.append('rect')
                .datum(event)
                .attr('class', 'color-legend-swatch')
                .attr('x', left)
                .attr('y', top)
                .attr('width', config.swatch.width)
                .attr('height', config.swatch.height)
                .attr('fill', event.color);

            // append the text to the item group
            group.append('text')
                .datum(event)
                .attr('class', 'color-legend-text')
                .attr('font-size', config.label.fontSize)
                .attr('x', left + config.swatch.width + config.label.offsetLeft)
                .attr('y', top + config.label.offsetTop)
                .text(category);

            // return the item-group
            return group;
        };

        if (colorMap.default) {
            root.insert(function() {
                return renderColorLegend(idx++, 'default', colorMap.default).node();
            });
        }

        if (colorMap.section) {
            root.insert(function() {
                return renderColorLegend(idx++, 'section', colorMap.section).node();
            });
        }

        categories.forEach(function(category) {
            if (category in self.config.canvasStaticColors) {
                return;
            }
            root.insert(function() {
                return renderColorLegend(idx++, category, colorMap[category]).node();
            });
        });

        // add the root group onto the canvas
        this.canvas.svg.insert(function() { return root.node(); });

        // update the canvas height
        this._offsetHeight(numLines * (config.swatch.height + config.padding));

        return this;
    },

    _renderGrid: function(timeScale, ticks) {
        this.canvas.svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + (this.calcBarTop(this.dataLen - 1) + this.canvas.barHeight) + ')')
            .call(
                d3.axisBottom().scale(timeScale)
                    .ticks(ticks.format, ticks.offset)
                    .tickSize(-(this.canvas.height - this.canvas.offsetHeight + this.canvas.offsetTop), 0, 0)
                    .tickFormat('')
            );

        return this;
    },

    _renderAxisX: function(timeScale, ticks) {

        var timeFormat = this.config.timeFormat;

        // add the time scale to the bottom x-axis
        this.canvas.svg.append('g')
            .attr('class', 'xaxis axis')
            .attr('transform', 'translate(0, ' + (this.calcBarTop(this.dataLen - 1) + this.canvas.barHeight) + ')')
            .call(
                d3.axisBottom().scale(timeScale)
                    .ticks(ticks.format, ticks.offset)
                    .tickFormat(timeFormat)
            );

        // transform all the text elements for the x-axis
        // this makes sure that they fit next to each other without overlapping
        this.canvas.svg.selectAll('.xaxis text')
            .attr('transform', function(d) {
                var bounds = this.getBBox();
                return 'translate(' + (bounds.height * -2) + ',' + bounds.height + ')rotate(-45)';
            })
            .attr('y', function(d) {
                // since rotation brings the end of the tick label above the axis
                // 10px represents the padding above the label, under the x-axis line
                // we are just pushing it down a little bit
                var bounds = this.getBBox();
                return bounds.y + bounds.height / 2;
            })
            .append('title')
            .text(function(d) { return timeFormat(d); });

        return this;
    },

    _offsetHeight: function(add) {
        this.canvas.offsetHeight += add;
        this.canvas.svg.attr('height', this.canvas.fnOuterHeight());
        return this;
    }
};
TimelineGraph.prototype.constructor = TimelineGraph;







/**
 *
 * @param {Array<Object>} stopwatchCollection Array of reduced stopwatches
 * @constructor
 */
function Stopwatch(stopwatchCollection) {
    if (!Array.isArray(stopwatchCollection)) {
        stopwatchCollection = [stopwatchCollection];
    }
    TimelineGraph.call(this, Stopwatch.aggregateSections(stopwatchCollection.reduce(function(sections, stopwatch) {
        return sections.concat( stopwatch.sections );
    }, [])));
    this.config.id = 'stopwatch-timeline';
}

Stopwatch.prototype = Object.create(TimelineGraph.prototype, {
    constructor: {
        value: Stopwatch
    }
});

/**
 * @see TimelineGraph._renderBackground
 */
Stopwatch.prototype._renderBackground = function(timeScale, ticks) {
    // render section backgrounds
    this._renderSectionBackgrounds(timeScale);

    // render our memory graph
    this._renderMemoryGraph(timeScale);

    // render the time-scale grid (vertical lines)
    this._renderGrid(timeScale, ticks);

    return this;
};

/**
 * Render a memory usage graph inside the timeline
 * @param {Function} timeScale The d3 timescale
 * @returns {Stopwatch}
 * @protected
 */
Stopwatch.prototype._renderMemoryGraph = function(timeScale) {
    // TODO: finish
    // period data is { ... , memory: { external: number, heapTotal: number, heapUsed: number, rss: number } }
    // we want to graph period.memory.rss on the same timescale, using period.startedAt
    // the graph is a connected line graph, with a background color
    // the background color will show on a scale from green (good) to yellow (warning) to orange (danger) to red (bad) using a static upper and lower rss bounds
    // the graph sits above the sections, but under the grid, which is under the bars

    return;

    var self = this;

    // define the line
    var line = this.canvas.svg.line()
        .attr('x', function(d) { return self.calcLeft(d.idx); })
        .attr('y', function(d) { return self.calcTop(d.idx); });



    return this;
};

/**
 * Stopwatch helper functions for commonly used operations
 * @type {Object}
 */
Stopwatch.helpers = {
    /**
     * Array.sort compare function for an array of periods
     * @param {Object} a
     * @param {Object} b
     * @returns {number}
     */
    sortPeriod: function(a, b) {
        return a.start - b.start || a.end - b.end;
    },

    /**
     * Array.map function for an array of periods so we can attach the started and end JS date for D3 to plot with
     * @param {Object} period The JSON encoded StopwatchPeriod
     * @returns {Object}
     */
    mapPeriods: function(period) {
        period.startedAt = new Date();
        period.startedAt.setTime(period.start / 1000);

        period.finishedAt = new Date();
        period.finishedAt.setTime(period.end / 1000);

        return period;
    }
};

/**
 * Recursively flatten an array of sections into a data map of periods
 * @param {Array<Object>} sections An array of stopwatch sections
 * @returns {Object}
 */
Stopwatch.flattenSections = function flattenSections(sections) {
    var i,
        x,
        d,
        xlen,
        event,
        section,
        periods,
        dataset = {},
        len = sections.length;

    // TODO: I think some of this needs to be in the collector itself (hasPeriods, firstPeriod, lastPeriod)

    for (i = 0; i < len; i++) {
        section = sections[i];
        if (section.name && !(section.id in dataset)) {
            dataset[section.id] = new TimelineData({
                id: section.id,
                isSection: true,
                section: section.name,
                name: null,
                category: 'section',
                periods: [],
                hasPeriods: false,
                firstPeriod: {start: 0, end: 0, startedAt: 0, finishedAt: 0},
                lastPeriod: {start:0, end: 0, startedAt: 0, finishedAt: 0}
            });
        }
        xlen = section.events.length;
        for (x = 0; x < xlen; x++) {
            event = section.events[x];
            if (event.periods.length !== 0) {
                if (!(event.id in dataset)) {
                    dataset[event.id] = new TimelineData({
                        id: event.id,
                        isSection: false,
                        section: section.name,
                        name: event.name,
                        category: event.category || 'default',
                        periods: [],
                        hasPeriods: false,
                        firstPeriod: {start:0, end: 0, startedAt: 0, finishedAt: 0},
                        lastPeriod: {start:0, end: 0, startedAt: 0, finishedAt: 0}
                    });
                }
                periods = event.periods.map(Stopwatch.helpers.mapPeriods);
                dataset[event.id].periods = dataset[event.id].periods.concat(periods).sort(Stopwatch.helpers.sortPeriod);
                dataset[event.id].firstPeriod = dataset[event.id].periods[0];
                dataset[event.id].lastPeriod = dataset[event.id].periods[ dataset[event.id].periods.length - 1 ];
                dataset[event.id].hasPeriods = true;
                if (section.name) {
                    dataset[section.id].periods = dataset[section.id].periods.concat(periods)
                        .sort(Stopwatch.helpers.sortPeriod);
                    dataset[section.id].firstPeriod = dataset[section.id].periods[0];
                    dataset[section.id].lastPeriod = dataset[section.id].periods[ dataset[section.id].periods.length - 1];
                    dataset[section.id].hasPeriods = true;
                }
            }
        }
        if (section.sections.length !== 0) {
            d = Stopwatch.flattenSections(section.sections);
            for (x in d) {
                if (x in dataset) {
                    dataset[x].periods = dataset[x].periods.concat(d[x].periods).sort(Stopwatch.helpers.sortPeriod);
                    dataset[x].firstPeriod = dataset[x].periods[0];
                    dataset[x].lastPeriod = dataset[x].periods[ dataset[x].periods.length - 1 ];
                    dataset[x].hasPeriods = true;
                } else {
                    dataset[x] = d[x];
                }
            }
        }
    }

    return dataset;
};

/**
 * Aggregate an array of stopwatch sections into a flat array of plottable objects
 * @param {Array<Object>} sections An array of stopwatch sections
 * @returns {Array<Object>}
 */
Stopwatch.aggregateSections = function(sections) {
    // flatten our sections into a plottable object map
    var data = Stopwatch.flattenSections(sections);

    // sort the data by periods asc and map it to an array of objects
    return Object.keys(data).sort(function(a, b) {
        a = data[a];
        b = data[b];

        var diff;
        if (!a.hasPeriods) {
            diff = b.hasPeriods ? 1 : 0;
        } else if (!b.hasPeriods) {
            diff = a.hasPeriods ? -1 : 0;
        } else {
            diff = a.firstPeriod.start - b.firstPeriod.start;
        }

        if (diff === 0) {
            // sections contain event periods, just as events do
            // if the starting periods are the same, the section wins
            if (a.isSection) {
                return -1;
            }
            if (b.isSection) {
                return 1;
            }
            // if they started at the same time, put the shorter duration first
            diff = a.lastPeriod.end - b.lastPeriod.end;
        }

        return diff;

    }).map(function(key, idx) {

        data[key].idx = idx;
        return data[key];
    });
};
//adapted from https://bl.ocks.org/ElisaDnr/b3bb401ddbd466275cfe98da8da8e36b
//adapted from http://bl.ocks.org/GuilloOme/75f51c64c2132899d58d4cd6a23506d3
//adapted from https://beta.observablehq.com/@mbostock/d3-calendar-view

var width = 960,
    height = 120,
    cellSize = 16; // cell size

// var percent = d3.format(".1%"),
//     format = d3.timeFormat("%Y-%m-%d");    //TODO MATCH DATE FORMAT

var calformat = d3.timeFormat("%Y-%m-%d");    //TODO MATCH DATE FORMAT

var calcolor = d3.scaleQuantize()
    .domain([0, 463]) //was -0.05 to 0.05
    .range(d3.range(10).map(function(d) { return "q" + d + "-10"; })); //was 11 not 10 in both places

var svgCal = d3.select("#calendar").selectAll("svg")
    //.data(d3.range(1990, 2011)) //TODO MATCH DATE RANGE
    .data(d3.range(2015, 2019)) //TODO MATCH DATE RANGE
    .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "viridis")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svgCal.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

var rect = svgCal.selectAll(".calDay")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("class", "calDay")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d),d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(calformat);

rect.append("title")
    .text(function(d) { return d; });

svgCal.selectAll(".calMonth")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("class", "calMonth")
    .attr("d", monthPath);

d3.csv("data/data.csv", function(error, csv) {
    if (error) throw error;

    //group by date
    var data = d3.nest()
        .key(function(d) {return d.date;})
        .rollup(function(d) {return d.length;})
        //.entries(csv)
        .map(csv);

    //try
    rect.filter(function(d) { return data.has(d); })
        .attr("class", function(d) { return "day " + calcolor(data.get(d)); })
        .select("title")
        .text(function(d) { return d + ": " + data.get(d); });

});

function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0),t0),
        d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1),t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
}
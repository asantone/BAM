//adapted from https://bl.ocks.org/ElisaDnr/b3bb401ddbd466275cfe98da8da8e36b
//adapted from http://bl.ocks.org/GuilloOme/75f51c64c2132899d58d4cd6a23506d3
//adapted from https://beta.observablehq.com/@mbostock/d3-calendar-view




//var width = 960;
//var height = 120;
var cellSize = 16; // cell size

var margin = {top: 5, right: 5, bottom: 5, left: -100},
    padding = {top: 20, right: 20, bottom: 20, left: 20},
    outerWidth = 1000,
    outerHeight = 180,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;


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
    .attr("transform", "translate(-35," + cellSize * 3.5 + ")rotate(-90)") //3.5
    .style("text-anchor", "middle")
    .text(function(d) { return d; });


//month and day text
//https://bl.ocks.org/ElisaDnr/b3bb401ddbd466275cfe98da8da8e36b
month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
for(var i =0; i < month.length; i++){
    x = 5 + (5*i); // 5 7
    x = x+ "em";
    svgCal.append("text")
        .attr("class", month[i])
        .style("text-anchor", "end")
        .attr("dy", "-.15em") //-.25
        .attr("dx", x)
        .text(month[i]);
}

days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
for(var j =0; j < days.length; j++){
    y = 0.8 + (1.15*j); // 0.8 1.7
    y = y + "em";
    svgCal.append("text")
        .attr("class", days[j])
        .style("text-anchor", "end")
        .attr("dy", y)
        .attr("dx", "-0.25em") //1
        .text(days[j]);
}

//end month and day text

//tooltips
var caltip = d3.tip(); //use default tooltips in browser
svgCal.call(caltip);

//set up squares
var rect = svgCal.selectAll(".calDay")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("rect")
    .attr("class", "calDay")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d),d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(calformat)
    .on('mouseover', caltip.show)
    .on('mouseout', caltip.hide);

rect.append("title")
    .text(function(d) { return d; });

svgCal.selectAll(".calMonth")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("class", "calMonth")
    .attr("d", monthPath);



//legend
//https://bl.ocks.org/ElisaDnr/b3bb401ddbd466275cfe98da8da8e36b
var svgLegend = d3.select("#legendCal").selectAll("svg")
    .data(d3.range(1)) //TODO MATCH DATE RANGE
    .enter().append("svg")
    .attr("width", 1000)
    .attr("height", 40)
    .attr("class", "legendCal")
    .append("g")
    .attr("transform", "translate(5,5)");

svgLegend.append("text")
    .attr("x", 270)
    .attr("y", 25)
    .text("Fewer Registrations");

var rectangle = svgLegend.append("rect")
    .attr("x", 410)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill","#34638b");

svgLegend.append("rect")
    .attr("x", 440)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill","#5f8ca4");

svgLegend.append("rect")
    .attr("x", 470)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill","#8bb6be");

svgLegend.append("rect")
    .attr("x", 500)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20).attr("fill","#b7e0d8");

svgLegend.append("text")
    .attr("x", 530)
    .attr("y", 25)
    .text("More registrations");
//end legend


d3.csv("data/data.csv", function(error, csv) {
    if (error) throw error;

    //group by date
    var data = d3.nest()
        .key(function(d) {return d.date;})
        .rollup(function(d) {return d.length;})
        //.entries(csv)
        .map(csv);

    console.log(data);

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

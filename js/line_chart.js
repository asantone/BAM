
var filteredByDateData = data;


// SVG drawing area
var margin = {top: 10, right: 30, bottom: 60, left: 40};

var width = 1225 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;

var svg = d3.select("#viz1").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	    .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%m/%-d/%y");

// converting to 4-digit years
var year = formatDate();

// adding commas to numbers
var format_number = d3.format(",");

// set the ranges
var xScale =  d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);


// set up x-axis
var xAxis = d3.axisBottom()
    .scale(xScale)
     .tickSize(16, 0)
     .tickFormat(d3.timeFormat("%b '%y"));

// set up y-axis
var yAxis = d3.axisLeft()
    .scale(yScale);

// prepare x-axis
svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + (height) + ")")
    .selectAll("text")
    .style("text-anchor", "end");

// prepare y-axis
svg.append("g")
    .attr("class", "axis y-axis")
    .attr("transform", "translate(" + 0 + ",0)");


// prepare the line
// via https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
var line = svg.append("g")
    .attr("d", "line")
    .attr("fill", "none")
    .attr("stroke", "#639AC3")
    .attr("stroke-width", "1")
    .attr("class", "pathline")
    .append("path");


// prepare the data dots
//var data_dots = svg.append("g")
//   .attr("class", "dot");


// set up tool tips
/*var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0]);
svg.call(tip);*/


// Initialize data
loadData();


// licensing data
var data;

// Load CSV file
function loadData() {
	d3.csv("data/Seattle_Pet_Licenses_Deduped_Filtered.csv", function(error, csv) {

        csv.forEach(function (d) {
            // Convert string to 'date object'
            d.license_issue_date = parseDate(d.license_issue_date);
        });

        // Store csv data in global variable
        data = csv;

        // console.log(data);


        var countRegByDate = [];

        // Group data by date and count registrations for each day
        countRegByDate = d3.nest()
            .key(function (d) {
                return d.license_issue_date;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(data);

        // console.log("countRegByDate is ");
        // console.log(countRegByDate);

        countRegByDate.forEach(function (d) {
            d.key = new Date(d.key);
        });

        countRegByDate.sort(function (a, b) {
            return d3.ascending(a.key, b.key);
        });

        console.log("countRegByDate is ");
        console.log(countRegByDate);


        // Draw the visualization for the first time
        // updateVisualization(countRegByDate);

        // Render visualization

        // remove existing path
        // thanks to the kind folks at
        // https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
        // d3.select("path.line").remove();


        // establish domains
       /* xScale.domain([d3.min(countRegByDate, function (d) {
            return d.key;
        }),
            d3.max(countRegByDate, function (d) {
                return d.key;
            })]);
        */
        xScale.domain([new Date(2015, 0, 1), new Date(2018, 11, 31)])

        // yScale domain
        yScale.domain([0, d3.max(countRegByDate, function (d) {
            return d.value;
        })])
        ;

        svg.select("g.x-axis")
            .transition()
            .duration(800)
            .ease(d3.easePoly)
            .call(xAxis);

        svg.select("g.y-axis")
            .transition()
            .duration(800)
            .ease(d3.easePoly)
            .call(yAxis)
            .transition()
            .duration(800)
            .ease(d3.easePoly);


        // set up the line
        // via https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
        var plotline = d3.line()
            .x(function (d) {
                return xScale(d.key);
            })
            .y(function (d) {
                return yScale(+d.value);
            })
        //d3.curveMonotoneX(40)
        ;

        // via https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
        line.datum(countRegByDate)
            .transition()
            .duration(1400)
            .attr("d", plotline)
            .transition()
            .duration(2000)
            //.ease("linear")
            .attr("style", "opacity: 1");


    });

	}; // end loadData function

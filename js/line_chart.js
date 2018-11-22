
var filteredByDateData = data;


// SVG drawing area
var margin = {top: 10, right: 30, bottom: 60, left: 40};

var width1 = 1225 - margin.left - margin.right,
		height1 = 300 - margin.top - margin.bottom;

var svg1 = d3.select("#viz1").append("svg")
		.attr("width", width1 + margin.left + margin.right)
		.attr("height", height1 + margin.top + margin.bottom)
	    .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
	d3.csv("data/Seattle_Pet_Licenses_Deduped.csv", function(error, csv) {

        var parseTime = d3.timeParse( "%m/%d/%Y" );
        var monthYearFormat = d3.timeFormat("%b %Y");
        var yearFormat = d3.timeFormat("%Y");

        console.log(parseTime("10/18/2018"));
        console.log(yearFormat(parseTime("10/18/2018")));

        console.log(parseTime(csv[2].license_issue_date));

        // Store csv data in global variable
        data = csv;

        var filtereddata = data.filter ( function ( d ) {
            //d.uid == "DogBenjaminBeagle98117"
            //return d.species == "Dog" && d["license_number"] !== "" || d.species == "Cat" && d["license_number"] !== ""
            return (d.species == "Dog" || d.species == "Cat")
                && (yearFormat(parseTime(d.license_issue_date)) == "2015" || yearFormat(parseTime(d.license_issue_date)) == "2016" || yearFormat(parseTime(d.license_issue_date)) == "2017" || yearFormat(parseTime(d.license_issue_date)) == "2018")
                && d["license_number"] !== ""
                ; });

        filtereddata.forEach(function (d) {
            // Convert string to 'date object'
            d.license_issue_date = parseTime(d.license_issue_date);
            d.license_issue_date = monthYearFormat(d.license_issue_date);
        });

        console.log(filtereddata);
        console.log(data[2].license_issue_date);


        var countRegByDate = [];

        // Group data by date and count registrations for each month
        countRegByDate = d3.nest()
            .key(function (d) {
                //formatDate = d3.time.format("%b-%Y");
                return  d.license_issue_date; //formatDate()

            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(filtereddata);


         console.log("countRegByDate is ");
         console.log(countRegByDate);

        countRegByDate.forEach(function (d) {
            d.key = new Date(d.key);
        });

        countRegByDate.sort(function (a, b) {
            return d3.ascending(a.key, b.key);
        });

        console.log("countRegByDate is ");
        console.log(countRegByDate);

        // Scales and axes
        x = d3.scaleTime()
            .range([0, width1])
            //.domain(d3.extent(countRegByDate, function(d) { return d.key; }));
            .domain([new Date(2015, 0, 1), new Date(2018, 10, 1)]);

        y = d3.scaleLinear()
            .range([height1, 0])
            .domain([0, d3.max(countRegByDate, function(d) { return d.value; })]);

        xAxis = d3.axisBottom()
            .scale(x);

        yAxis = d3.axisLeft()
            .scale(y);

        // Append x-axis
        svg1.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + height1 + ")")
            .call(xAxis);

        // Append y-axis
        svg1.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0," + 10 + ")")
            .call(yAxis);


        // SVG area path generator
        var area = d3.area()
            .x(function(d) { return x(d.key); })
            .y0(height1)
            .y1(function(d) { return y(d.value); });

        console.log(area);

        // Draw area by using the path generator
        svg1.append("path")
            .datum(countRegByDate)
            .attr("fill", "#ddd")
            .attr("d", area);



    });

	} // end loadData function

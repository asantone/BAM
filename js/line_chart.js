
var filteredByDateData = data;


// SVG drawing area
var margin = {top: 40, right: 30, bottom: 40, left: 90};

var width1 = 800 - margin.left - margin.right,
		height1 = 450 - margin.top - margin.bottom;

var svg1 = d3.select("#viz1").append("svg")
		.attr("width", width1 + margin.left + margin.right)
		.attr("height", height1 + margin.top + margin.bottom)
        .attr("background-color","#475D74")
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
                //&& (yearFormat(parseTime(d.license_issue_date)) == "2015" || yearFormat(parseTime(d.license_issue_date)) == "2016" ||
                 &&   (yearFormat(parseTime(d.license_issue_date)) == "2017" || yearFormat(parseTime(d.license_issue_date)) == "2018")
            && monthYearFormat(parseTime(d.license_issue_date)) !== "Oct 2018"
                && d["license_number"] !== ""
                ; });


        filtereddata.forEach(function (d) {
            // Convert string to 'date object'
            d.license_issue_date = parseTime(d.license_issue_date);
            d.license_issue_date = monthYearFormat(d.license_issue_date);
        });


        var countRegByDate = [];
        //var countRegByDateYear = [];
        var countRegByDateMix = [];
        var countRegByDateSingle = [];

        //ALL


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

       // console.log("countRegByDate is ");
        //console.log(countRegByDate);


        countRegByDate.forEach(function (d) {
            d.key = new Date(d.key);
        });

        countRegByDate.sort(function (a, b) {
            return d3.ascending(a.key, b.key);
        });

///FILTER MIXED

        countRegByDateMix = d3.nest()
            .key(function (d) {
                //formatDate = d3.time.format("%b-%Y");
                return  d.license_issue_date; //formatDate()

            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(filtereddata.filter(
                function ( d ) {
                    return (d.combo_breed_group == "Mix (Inferred)" || d.combo_breed_group == "Mix (Explicit)"  )
                }
            ));


        countRegByDateMix.forEach(function (d) {
            d.key = new Date(d.key);
        });

        countRegByDateMix.sort(function (a, b) {
            return d3.ascending(a.key, b.key);
        });



///FILTER SINGLE

        countRegByDateSingle = d3.nest()
            .key(function (d) {
                //formatDate = d3.time.format("%b-%Y");
                return  d.license_issue_date; //formatDate()

            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(filtereddata.filter(
                function ( d ) {
                    return (d.combo_breed_group == "SingleBreed"  )
                }
            ));


        countRegByDateSingle.forEach(function (d) {
            d.key = new Date(d.key);
        });

        countRegByDateSingle.sort(function (a, b) {
            return d3.ascending(a.key, b.key);
        });


        // Scales and axes
        x = d3.scaleTime()
            .range([0, width1])
            //.domain(d3.extent(countRegByDate, function(d) { return d.key; }));
            .domain([new Date(2017, 0, 1), new Date(2018, 8, 1)]);

        x2 = d3.scaleBand()
            .range([0, width1])
            .domain([0,100]);
                //.domain(d3.extent(countRegByDate, function(d) { return d.key; }));
            //.domain([0, d3.max(countRegByDate, function(d) { return d.key; })]);


        y = d3.scaleLinear()
            .range([height1, 0])
            .domain([0, d3.max(countRegByDate, function(d) { return d.value; })]);

        xAxis = d3.axisBottom()
            .scale(x)
            .ticks(d3.timeMonth.every(4));

        yAxis = d3.axisLeft()
            .scale(y);

        // Append x-axis
        svg1.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + height1 + ")")
            .call(xAxis .tickFormat(monthYearFormat))
        ;

        // Append y-axis
        svg1.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0," + 0 + ")")
            //.call(g => g.select(".domain").remove())
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Licenses Issued")
        // remove y axis line
        // .select(".domain").remove()
        // .selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2")
        // .selectAll(".tick text").attr("x", 4).attr("dy", -4)
            ;

        // SVG area path generator
        var line1 = d3.line()
            //.interpolate("basis")
            //.curve(d3.curveBasis)
            .x(function(d) { return x(d.key); })
            //.y0(height1)
            .y(function(d) { return y(d.value); });

        var line2 = d3.line()
        //.interpolate("basis")
            //.curve(d3.curveBasis)
            .x(function(d) { return x(d.key); })
            //.y0(height1)
            .y(function(d) { return y(d.value); });


        var line3 = d3.line()
        //.interpolate("basis")
        //.curve(d3.curveBasis)
            .x(function(d) { return x(d.key); })
            //.y0(height1)
            .y(function(d) { return y(d.value); });

        // SVG area path generator
        //var line2 = d3.line()
          //  .x(function(d) { return x(d.key); })
            //.y0(height1)
            //.y(function(d) { return y(d.value); });

        //console.log(line);

        function transition(path) {
            path.transition()
                .duration(9000)
                .attrTween("stroke-dasharray", tweenDash);
        }

        function tweenDash() {
            var l = this.getTotalLength(),
                i = d3.interpolateString("0," + l, l + "," + l);
            return function (t) { return i(t); };
        }

        // Draw ALL line by using the path generator
        svg1.append("path")
            .datum(countRegByDate)
            //.attr("fill", "#ddd")
            .attr ( "class" , "line" )
            .attr("d", line1)
            .call(transition);

        console.log(x(countRegByDate[2].key));

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>"+ monthYearFormat(d.key)+" </strong> <br> <br> Pet Licenses  <br> <span style='color:white'>" + d.value + "</span>";
            });

        svg1.call(tip);


        svg1.selectAll( "circle" )
            .data ( countRegByDate.filter(
                function ( d ) {
                    return ( monthYearFormat(d.key) == "Apr 2017"  || monthYearFormat(d.key) == "Jul 2017"  || monthYearFormat(d.key) == "Jan 2018" || monthYearFormat(d.key) == "Apr 2018"  || monthYearFormat(d.key) == "Sep 2018"  )
                } ))

            .enter()

            .append ( "circle" )
            .attr ( "cx" , function ( d ) { return x(d.key) })
            .attr ( "cy" , function ( d ) { return y(d.value)})
            .attr ( "r" , 6 )
            .style ( "fill" , "pink" )
            .style ( "stroke" , "gray" )
            .style ( "stroke-width" , 0.3)
            .style ( "opacity" , 0 )

            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

        ;

        svg1.selectAll("circle")
            .data ( countRegByDate.filter(
                function ( d ) {
                    return ( monthYearFormat(d.key) == "Apr 2017"  || monthYearFormat(d.key) == "Jul 2017"  || monthYearFormat(d.key) == "Jan 2018" || monthYearFormat(d.key) == "Apr 2018"  || monthYearFormat(d.key) == "Sep 2018"  )
                } ))
            .transition()
            .delay(9000)					// <-- A static, 1s delay before transition begins
            .duration(2000)
            .attr ( "cx" , function ( d ) { return x(d.key) })
            .attr ( "cy" , function ( d ) { return y(d.value)})
            .attr ( "r" , 8 )
            .style ( "fill" , "dd1c77" )
            .style ( "stroke" , "white" )
            .style ( "stroke-width" , 2)
            .style ( "opacity" , 0.9 );



        // var tip2 = d3.tip()
        //     .attr('class', 'd3-tip')
        //     .offset([-10, 0])
        //     .html(function(d) {
        //         return "<strong>Event</strong> <br> <br>    " +
        //             "<span style='color:aliceblue'>" + d.value + "</span>"
        //             ;
        //     });

        // svg1.call(tip2);
        //
        // svg1.selectAll( "circle-high" )
        //     .data ( countRegByDate.filter(
        //         function ( d ) {
        //             return (monthYearFormat(d.key) == "Jan 2017" || monthYearFormat(d.key) == "Apr 2017"  || monthYearFormat(d.key) == "Jul 2017"  || monthYearFormat(d.key) == "Apr 2018"  || monthYearFormat(d.key) == "Aug 2018"  )
        //         } ))
        //
        //     .enter()
        //     .append ( "circle" )
        //     .attr ( "cx" , function ( d ) { return x(d.key) })
        //     .attr ( "cy" , function ( d ) { return y(d.value)})
        //     .attr ( "r" , 8 )
        //     .style ( "fill" , "blue" )
        //     .style ( "stroke" , "white" )
        //     .style ( "stroke-width" , 0.5)
        //     .style ( "opacity" , 0.2 )
        //
        //     .on('mouseover', tip2.show)
        //     .on('mouseout', tip2.hide)
        //
        // ;
        //
        // svg1.selectAll("circle-high")
        //     .data( countRegByDate)
        //     .transition()
        //     .delay(2000)					// <-- A static, 1s delay before transition begins
        //     .duration(2000)
        //     .attr ( "cx" , function ( d ) { return x(d.key) })
        //     .attr ( "cy" , function ( d ) { return y(d.value)})
        //     .attr ( "r" , 8 )
        //     .style ( "fill" , "blue" )
        //     .style ( "stroke" , "white" )
        //     .style ( "stroke-width" , 0.5)
        //     .style ( "opacity" , 0.9 );



        var format = d3.format(",d");

        d3.select("h5.Year2017")
            .transition()
            .duration(5000)
            .on("start", function repeat() {
                d3.active(this)
                    .tween("text", function() {
                        var that = d3.select(this),
                            i = d3.interpolateNumber(that.text().replace(/,/g, ""), 19133);
                        return function(t) { that.text(format(i(t))); };
                    })
                    .transition()
                    .delay(0)
                    .on("start", repeat);
            });


        d3.select("h5.Year2018")
            .transition()
            .duration(4000)
            .delay(5000)
            .on("start", function repeat() {
                d3.active(this)
                    .tween("text", function() {
                        var that = d3.select(this),
                            i = d3.interpolateNumber(that.text().replace(/,/g, ""), 24394);
                        return function(t) { that.text(format(i(t))); };
                    })
                    .transition()
                    .delay(5000)
                    .on("start", repeat);
            });


        // //SVG2 ANIMATED BAR CHARTS
        // var svg2 = d3.select("#viz1").append("svg")
        //     .attr("width", width1 + margin.left + margin.right)
        //     .attr("height", height1 + margin.top + margin.bottom)
        //     .attr("background-color","#fee0d2")
        //     .append("g")
        //     .attr("transform", "translate(" + margin.left +"," + margin.top + ")");
        //
        //
        //
        //
        // // Scales and axes
        //
        // xbar = d3.scaleTime()
        //     .range([  0, width1 ])
        //     //.rangeRoundBands([height, 0], .3, .3)
        //     .domain([new Date(2017, 0, 0), new Date(2018, 0, 0)]);
        //     //.domain(countRegByDate.map(function(d) { return monthYearFormat(d.key) }));
        //
        // ybar = d3.scaleLinear()
        //     .range([height1,0 ])
        //     .domain([0, d3.max(countRegByDate, function(d) { return d.value })]);
        //
        // console.log(monthYearFormat(countRegByDate[8].key));
        // console.log(xbar(monthYearFormat(countRegByDate[8].key)));
        // console.log(ybar(countRegByDate[10].value));
        //
        // xAxisbar = d3.axisBottom()
        //     .scale(xbar);
        //     //.ticks(d3.timeMonth.every(4));
        //
        // yAxisbar = d3.axisLeft()
        //     .scale(ybar);
        //
        //
        // var bar = svg2.selectAll(".bar")
        //     .data(countRegByDate)
        //     .enter().append("g")
        //     .attr("class", "bar");
        //
        // bar.append("rect")
        //     .attr("x", function(d) { return xbar(d.key); })
        //     .attr("y", function(d) { return ybar(d.value); })
        //     .attr("height", function(d) { return height1 - ybar(d.value); })
        //     .attr("width", 20)
        //     .style("fill","#1a9850");
        //
        // bar.append("text")
        //     .attr("y", 5)
        //     .attr("x", function(d) { return xbar(d.key) ; })
        //     .text(0);
        // //.text(function(d) { return d.value });
        //
        // bar.selectAll("rect")
        //     .transition()
        //     //.ease(d3.easeLinear)
        //     .duration(2000)
        //     .delay(0)
        //     .attr("height", function(d) { return ybar(d.value); });
        //
        // bar.selectAll("text").transition().ease(d3.easeLinear).duration(2000).delay(0)
        //     .attr("y", function(d) { return ybar(d.value) + 3; })
        //
        //     .on("start", function repeat() {
        //         d3.active(this)
        //             .tween("text", function() {
        //                 var that = d3.select(this),
        //                     i = d3.interpolateNumber(that.text().replace(/,/g, ""), 1000);
        //                 return function(t) { that.text(format(i(t))); };
        //             })
        //             .transition()
        //             .delay(1000)
        //             .on("start", repeat);
        //     });

        //
        // svg2.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + height1 + ")")
        //     .call(xAxisbar);
        //
        // // svg2.append("g")
        // //     .attr("class", "y axis")
        // //     .call(yAxisbar)
        // //     .selectAll("text")
        // //     .style("font-weight","bold");
        //
        // d3.select(self.frameElement).style("height", (height1 + margin.top + margin.bottom) + "px");

        // // Draw MIXED line by using the path generator
        // svg1.append("path")
        //     .datum(countRegByDateMix)
        //     //.attr("fill", "#ddd")
        //     .transition()
        //     .delay ( 5000 ) //
        //     .duration ( 5000 ) //
        //     .ease (d3.easeLinear )
        //     .attr ( "class" , "line-mixed" )
        //     .attr("d", line2)
        // ;
        //
        // // Draw SINGLE BREED line by using the path generator
        // svg1.append("path")
        //     .datum(countRegByDateSingle)
        //     //.attr("fill", "#ddd")
        //     .transition()
        //     .delay ( 100 ) //
        //     .duration ( 5000 ) //
        //     .ease (d3.easeLinear )
        //     .attr ( "class" , "line-single" )
        //     .attr("d", line3)
        // ;

    //
    //
    //     var test = csv.filter ( function ( d ) {
    //         //d.uid == "DogBenjaminBeagle98117"
    //         //return d.species == "Dog" && d["license_number"] !== "" || d.species == "Cat" && d["license_number"] !== ""
    //         return (d.species == "Dog" || d.species == "Cat")
    //             //&& (yearFormat(parseTime(d.license_issue_date)) == "2015" || yearFormat(parseTime(d.license_issue_date)) == "2016" ||
    //             &&   (yearFormat(parseTime(d.license_issue_date)) == "2017" || yearFormat(parseTime(d.license_issue_date)) == "2018")
    //             && monthYearFormat(parseTime(d.license_issue_date)) !== "Oct 2018"
    //             && d["license_number"] !== ""
    //             ; });
    //
    //     console.log(test);
    //
    //     test.forEach(function (d) {
    //         // Convert string to 'date object'
    //         //d.license_issue_date = parseTime(d.license_issue_date);
    //         d.license_issue_date = d.species;
    //     });
    //
    //     console.log(test[100].license_issue_date);
    //
    //     // Group data by date and count registrations for each Year
    //     countRegByDateYear = d3.nest()
    //         .key(function (d) {
    //             //formatDate = d3.time.format("%b-%Y");
    //             return  d.license_issue_date; //formatDate()
    //
    //         })
    //         .rollup(function (leaves) {
    //             return leaves.length;
    //         })
    //         .entries(test);
    //
    //     console.log("countRegByDateYear is ");
    //     console.log(countRegByDateYear);
    //
    //
    //     countRegByDateYear.forEach(function (d) {
    //         d.key = new Date(d.key);
    //     });
    //
    //     countRegByDateYear.sort(function (a, b) {
    //         return d3.ascending(a.key, b.key);
    //     });
    //
    //     console.log("countRegByDateYear is ");
    //     console.log(countRegByDateYear);
    //

     });


	}// end loadData function

// The breed-grid viz. Here goes nothing!

// User selection = the breed corresponding to image clicked by user
var selected_breed = "";

// turn provided dates to date objects
var parseDate = d3.timeParse("%m/%-d/%y");

// Initialize data
loadData();

// licensing data
var breedData;

// Now let's try to get real data!  Try the rollup thing, perhaps?

// Load CSV file
function loadData() {
    d3.csv("data/Seattle_Pet_Licenses_Deduped_Filtered.csv", function(error, csv) {
        // Store csv data in global variable
        csv.forEach(function (d) {
            // Convert string to 'date object'
            d.license_issue_date = parseDate(d.license_issue_date);
        });

        breedData = csv;
        //console.log(breedData);

        // we just want the dog data - so filter . .
        // var newArray = array.filter(function(item) {
        //   return condition;
        // });

        dogBreedData = breedData.filter(function(item) {
            return item.species == "Dog";
        });

        // console.log("dogBreedData is");
        // console.log(dogBreedData);

        var countByDogBreed = [];
        // Group data by dog breed and count breed numbers for entire period
        countByDogBreed = d3.nest()
            .key(function (d) {
                return d.primary_breed;
            })
            .rollup(function (leaves) {
                return leaves.length;
            })
            .entries(dogBreedData);

        // console.log("countByDogBreed is ");
        // console.log(countByDogBreed);

        // sort countByDogBreed in descending order
        countByDogBreed.sort(function(a,b) {
                return d3.descending(a.value, b.value);
        })

        // console.log("sorted countByDogBreed is");
        // console.log(countByDogBreed);

        // we just need the top 20 breeds
        // cannot just copy the original array and then use .length (grrrr)
        // so I'm slicing the original array instead
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
        var top20DogBreeds = countByDogBreed.slice(0, 20);
        // top20DogBreeds.length = 20;

        // console.log("top20DogBreeds is");
        // console.log(top20DogBreeds);

        createGrid(top20DogBreeds);


    });
};

// Let's make a 4x5 grid with this data!
// Currently the no. of photos across is determined by div size
// as specified in css file

function createGrid(data) {

    var top20DogBreeds = data;
    var grid_div = d3.select("#breed_grid");
    var info_div = d3.select("#breed_info");


    grid_div.append("g");


    // TOOLTIPS!!
    // Cannot use d3-tip on regular HTML elements, so trying advice from
    // https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/#creating-a-tooltip-using-mouseover-events


    // Next up: string manipulation
    // Need function to remove commas and spaces in provided breed names
    // so we can access the correspondingly named image files
    // https://stackoverflow.com/questions/36817120/javascript-remove-fullstop-comma-and-spaces-from-a-string/36817149

    function removeCommasAndSpaces(string) {
        var regex = /[.,\s]/g;
        return string.replace(regex, '');
    }

    grid_div.selectAll("div")
        .data(top20DogBreeds)
        .enter()
        .append("div")
        .style("border", "1pt solid #D9C191")
        .style("width", "100px")
        .style("height", "100px")
        .style("display", "inline-block")
        .style("background-image", function(d) {
                return "url('img/cropped_images/" + removeCommasAndSpaces(d.key) + ".jpg')"
        })
        .style("filter","grayscale(100) opacity(60%)")
        .on("mouseover", function() {
            d3.select(this)
                .style("filter", "none")
                .style("cursor", "pointer")
                .attr("title", function(d) { return d.key;})

        })
        .on("mouseout", function() {
            d3.select(this)
                .style("filter", "grayscale(100) opacity(60%)");
        })
        .on("click", function(d, i) {
            var index = i;
            selected_breed = d.key;
            console.log("The selected breed is " + selected_breed + ".")
            updateDetails(index);

        });

    function updateDetails(index) {
        var ranking = index + 1;
        console.log("Outside the anonymous function, the selected breed is " + selected_breed + ".");
        d3.select("#breed_info")
            .html("<p class='breed_selection'>" + selected_breed + " </p> <p class='breed_description'>" + selected_breed + " is the #" + ranking + " -ranked breed based on pet registrations in Seattle, 2015 - 2018. (More info later.)</p>");




        createMiniViz();

        function createMiniViz() {
            // SVG drawing area

            var miniVizMargin = {top: 60, right: 20, bottom: 20, left: 50};

            var miniVizWidth = 650 - miniVizMargin.left - miniVizMargin.right,
                miniVizHeight = 260 - miniVizMargin.top - miniVizMargin.bottom;


            // remove existing chart, if present
            d3.select(".breed_chart").remove();

            // either way, create new chart

            var breed_mini_viz = d3.select("#breed_chart").append("svg")
                .attr("class", "breed_chart")
                //.style("border", "1px solid #BB9E64")
                .attr("width", miniVizWidth + miniVizMargin.left + miniVizMargin.right)
                .attr("height", miniVizHeight + miniVizMargin.top + miniVizMargin.bottom)
                .append("g")
                .attr("transform", "translate(" + miniVizMargin.left + "," + miniVizMargin.top + ")");


            // set the ranges
            var xScale =  d3.scaleTime().range([0, miniVizWidth]);
            var yScale = d3.scaleLinear().range([miniVizHeight, 0]);

            // set up x-axis
            var xAxis = d3.axisBottom()
                .scale(xScale)
                //.tickSize(16, 0)
                .tickFormat(d3.timeFormat("%b '%y"));

            // set up y-axis
            var yAxis = d3.axisLeft()
                .scale(yScale);

            // prepare x-axis
            breed_mini_viz.append("g")
                .attr("class", "axis x-axis")
                .attr("transform", "translate(0," + (miniVizHeight) + ")")
                .selectAll("text")
                .style("text-anchor", "end");

            // prepare y-axis
            breed_mini_viz.append("g")
                .attr("class", "axis y-axis")
                .attr("transform", "translate(" + 0 + ",0)");

            // prepare the line
            // via https://bl.ocks.org/NGuernse/58e1057b7174fd1717993e3f5913d1a7
            var line = breed_mini_viz.append("g")
                .attr("d", "line")
                .attr("fill", "none")
                .attr("stroke", "#639AC3")
                .attr("stroke-width", "1")
                .attr("class", "breedline")
                .append("path");

            // get data now, organize stuff better later
            var dataByDogBreed = [];
            // Group data by dog breed and count breed numbers for entire period

            console.log("dogBreedData is");
            console.log(dogBreedData);

            // filter for specific breed
            var dataByDogBreed = dogBreedData.filter(function(item) {
                return item.primary_breed == selected_breed;
            });
            console.log(dataByDogBreed);


            // get number per day (for now, should be by month, perferably)
            // Group data by date and count registrations for each day
            countByDogBreed = d3.nest()
                .key(function (d) {
                    return d.license_issue_date;
                })
                .rollup(function (leaves) {
                    return leaves.length;
                })
                .entries(dataByDogBreed);

            console.log("CountByDogBreed");
            console.log(countByDogBreed);

           countByDogBreed.forEach(function (d) {
                d.key = new Date(d.key);
            });

           countByDogBreed.sort(function (a, b) {
                return d3.ascending(a.key, b.key);
            });

            xScale.domain([new Date(2015, 0, 1), new Date(2018, 11, 31)]);

            // yScale domain
            yScale.domain([d3.min(countByDogBreed, function (d) {
                return d.value;
            }), 50])
            ;

            breed_mini_viz.select("g.x-axis")
                .call(xAxis);

            breed_mini_viz.select("g.y-axis")
                .call(yAxis);

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
            line.datum(countByDogBreed)
                .transition()
                .duration(1400)
                .attr("d", plotline)
                .transition()
                .duration(2000)
                //.ease("linear")
                .attr("style", "opacity: 1");

            // add title to chart
            breed_mini_viz.append("text")
                .attr("x", (miniVizWidth / 2) - 15)
                .attr("y", 0 - (miniVizMargin.top /3))
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("fill", "#475D74")
                .text("Number of " + selected_breed + "s registered per day in Seattle, 2015-2018");


        } // end function createMiniViz

    } // end function update Details



// see https://stackoverflow.com/questions/10608964/how-to-share-scope-between-functions-in-d3-js

} // end function createGraph()

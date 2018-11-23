// The breed-grid viz. Here goes nothing!

// User selection = the breed corresponding to image clicked by user
var selected_breed = "";

// turn provided dates into date objects
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
                .attr("title", function(d) { return d.key;})

        })
        .on("mouseout", function() {
            d3.select(this)
                .style("filter", "grayscale(100) opacity(60%)");
        })
        .on("click", function(d, i) {
            d3.select("#breed_info")
                .html("If this is working, you have just selected " + d.key + ". <br> This breed is the #" + (i+1) + " -ranked breed based on pet registrations in Seattle, 2015 - 2018.<br>");
            selected_breed = d.key;
            console.log("The selected breed is " + selected_breed + ".");

        });
// see https://stackoverflow.com/questions/10608964/how-to-share-scope-between-functions-in-d3-js

} // end function createGraph()

console.log("Outside the d3 function, the selected breed is " + selected_breed + ".");

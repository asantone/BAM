//Reference:
// Modified from: https://bl.ocks.org/caravinden/eb0e5a2b38c8815919290fa838c6b63b

var data = [
    // {
    //     "uniques": "Louie",
    //     "perc": 0.235
    // },
    // {
    //     "uniques": "Teddy",
    //     "perc": 0.235
    // },
    // {
    //     "uniques": "Lucky",
    //     "perc": 0.237
    // },
    // {
    //     "uniques": "Leo",
    //     "perc": 0.245
    // },
    // {
    //     "uniques": "Ellie",
    //     "perc": 0.248
    // },
    // {
    //     "uniques": "Zoey",
    //     "perc": 0.253
    // },
    // {
    //     "uniques": "Kona",
    //     "perc": 0.254
    // },
    // {
    //     "uniques": "Bear",
    //     "perc": 0.256
    // },
    // {
    //     "uniques": "Abby",
    //     "perc": 0.257
    // },
    // {
    //     "uniques": "Winston",
    //     "perc": 0.257
    // },
    // {
    //     "uniques": "Jake",
    //     "perc": 0.268
    // },
    // {
    //     "uniques": "Lulu",
    //     "perc": 0.276
    // },
    // {
    //     "uniques": "Murphy",
    //     "perc": 0.28
    // },
    // {
    //     "uniques": "Tucker",
    //     "perc": 0.283
    // },
    // {
    //     "uniques": "Gus",
    //     "perc": 0.294
    // },
    // {
    //     "uniques": "Oscar",
    //     "perc": 0.302
    // },
    // {
    //     "uniques": "Ginger",
    //     "perc": 0.312
    // },
    // {
    //     "uniques": "Gracie",
    //     "perc": 0.316
    // },
    // {
    //     "uniques": "Milo",
    //     "perc": 0.321
    // },
    // {
    //     "uniques": "Olive",
    //     "perc": 0.321
    // },
    // {
    //     "uniques": "Rocky",
    //     "perc": 0.325
    // },
    // {
    //     "uniques": "Riley",
    //     "perc": 0.328
    // },
    // {
    //     "uniques": "Toby",
    //     "perc": 0.336
    // },
    // {
    //     "uniques": "Pepper",
    //     "perc": 0.336
    // },
    // {
    //     "uniques": "Henry",
    //     "perc": 0.336
    // },
    {
        "uniques": "Zoe", //25
        "perc": 0.362
    },
    {
        "uniques": "Coco",
        "perc": 0.365
    },
    {
        "uniques": "Scout",
        "perc": 0.376
    },
    {
        "uniques": "Rosie",
        "perc": 0.384
    },
    {
        "uniques": "Chloe",
        "perc": 0.398
    },
    {
        "uniques": "Oliver", //20
        "perc": 0.413
    },
    {
        "uniques": "Penny",
        "perc": 0.424
    },
    {
        "uniques": "Lily",
        "perc": 0.424
    },
    {
        "uniques": "Ruby",
        "perc": 0.438
    },
    {
        "uniques": "Bailey",
        "perc": 0.449
    },
    {
        "uniques": "Sadie", //15
        "perc": 0.475
    },
    {
        "uniques": "Sophie",
        "perc": 0.475
    },
    {
        "uniques": "Jack",
        "perc": 0.49
    },
    {
        "uniques": "Maggie",
        "perc": 0.495
    },
    {
        "uniques": "Stella",
        "perc": 0.51
    },
    {
        "uniques": "Cooper", //10
        "perc": 0.511
    },
    {
        "uniques": "Lola",
        "perc": 0.537
    },
    {
        "uniques": "Molly",
        "perc": 0.539
    },
    {
        "uniques": "Buddy",
        "perc": 0.55
    },
    {
        "uniques": "Max",
        "perc": 0.557
    },
    {
        "uniques": "Daisy", //5
        "perc": 0.606
    },
    {
        "uniques": "Luna",
        "perc": 0.628
    },
    {
        "uniques": "Bella",
        "perc": 0.756
    },
    {
        "uniques": "Charlie",
        "perc": 0.83
    },
    {
        "uniques": "Lucy",
        "perc": 0.966
    }
];

//sort bars based on value
data = data.sort(function (a, b) {
    return d3.ascending(a.value, b.value);
})

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 35, left: 50},
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom;

// set the ranges
var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);

var x = d3.scaleLinear()
    .range([0, width]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#names25").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//add tooltip div
var tt = d3.select("body").append("div").attr("class", "barTT");

// format the data
data.forEach(function(d) {
    d.perc = +d.perc;
});

// Scale the range of the data in the domains
x.domain([0, d3.max(data, function(d){ return d.perc; })])
y.domain(data.map(function(d) { return d.uniques; }));

// append the rectangles for the bar chart
svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("width", function(d) {return x(d.perc); } )
    .attr("y", function(d) { return y(d.uniques); })
    .attr("height", y.bandwidth())
    .on("mousemove", function(d){
    tt
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html("The name "+(d.uniques)+ " represents " + "<br>" + (d.perc) + "% of the population.");
})
    .on("mouseout", function(d){ tt.style("display", "none");});

// text label for the x axis
svg.append("text")
    .attr("transform",
        "translate(" + (width/2) + " ," +
        (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("Percent Represented by each Name");

// add the x Axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// add the y Axis
svg.append("g")
    .call(d3.axisLeft(y));
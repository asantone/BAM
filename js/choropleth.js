
// Format functions
var formatComma = d3.format(","),
    formatCurrency = function(d) { return "$" + d3.format(",.2f")(d); };


// Initialize data
var map;
var pets;


// --> CREATE SVG DRAWING AREA
var width = 600,
    height = 600;

var svg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);


// Set up map
var projection = d3.geoAlbersUsa()
    .translate([width*40.9, height*27.3])
    .scale([80900]);

var path = d3.geoPath()
    .projection(projection);

var color = d3.scaleLinear()
    .range(["#b7e0d8", "#34638b"])
    .interpolate(d3.interpolateLab);


// Legend
var legend_width = 200,
    divisions = 100;


// Listen for select box changes
var selectID = d3.select("#data-type").property("value");

d3.select("#data-type").on("change", function() {
    selectID = d3.select("#data-type").property("value");
    index = configs.findIndex(function(config) {
        return config.key === selectID;
    });
    updateChoropleth();
});


// Data configurations: data keys, tooltips and map titles
var configs = [
    { key: "total_all_cnt", tip: "Number of Pets", title: "Total Number of Pets Per Zip Code in Seattle" },
    { key: "cat_all_cnt", tip: "Number of Cats", title: "Total Number of Cats Per Zip Code in Seattle" },
    { key: "dog_all_cnt", tip: "Number of Dogs", title: "Total Number of Dogs Per Zip Code in Seattle" },
];
var index = configs.findIndex(function(config) {
    return config.key === selectID;
});



// Tool tip
var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return "Zip Code: " + d.properties["ZCTA5CE10"] + "<br/>"  + configs[index].tip + ": " + formatComma(d.properties[selectID]) });

svg.call(tool_tip);








// Load data asynchronously
queue()
    .defer(d3.json,"data/zip-codes.geo.json")
    .defer(d3.csv,"data/zip_stats_filtered.csv")
    .defer(d3.csv,"data/Census_PopFacts_WA_edit.csv")
    .await(createVis);

function createVis(error, mapJson, petData, demData) {

    if(error) { console.log(error); }


    // Convert strings to numeric for both CSVs
    petData.forEach(function(d){
        d.cat_all_cnt =+ d.cat_all_cnt;
        d.dog_all_cnt =+ d.dog_all_cnt;
        d.total_all_cnt =+ d.total_all_cnt;
    });
    demData.forEach(function(d){
        d.Avg_HH_Inc =+ d.Avg_HH_Inc;
        d.Population =+ d.Population;
        d.Households =+ d.Households;
        d.Med_Age =+ d.Med_Age;
        d.Med_HH_Inc =+ d.Med_HH_Inc;
    });



    // Merge pets and demographic data
    for (var i = 0; i < petData.length; i++) {
        for (var j = 0; j < demData.length; j++) {
            if (petData[i].zip_code === demData[j].Area_Code) {
                petData[i].Avg_HH_Inc = demData[j].Avg_HH_Inc;
                petData[i].Population = demData[j].Population;
                petData[i].Households = demData[j].Households;
                petData[i].Med_Age = demData[j].Med_Age;
                petData[i].Med_HH_Inc = demData[j].Med_HH_Inc;
            }
        }
    }

    pets = petData;





    // Merge pet data and GeoJSON
    for (var i = 0; i < petData.length; i++) {
        for (var j = 0; j < mapJson.features.length; j++) {
            var zip = mapJson.features[j].properties.ZCTA5CE10;
            if (petData[i].zip_code === zip) {

                mapJson.features[j].properties.cat_all_cnt = petData[i].cat_all_cnt;
                mapJson.features[j].properties.dog_all_cnt = petData[i].dog_all_cnt;
                mapJson.features[j].properties.total_all_cnt = petData[i].total_all_cnt;
                mapJson.features[j].properties.Avg_HH_Inc = petData[i].Avg_HH_Inc;
                mapJson.features[j].properties.Population = petData[i].Population;
                mapJson.features[j].properties.Households = petData[i].Households;
                mapJson.features[j].properties.Med_Age = petData[i].Med_Age;
                mapJson.features[j].properties.Med_HH_Inc = petData[i].Med_HH_Inc;
                break;

            }
        }
    }



    map = mapJson;


    // Update choropleth
    updateChoropleth();

}

function updateChoropleth() {

    // Set domain
    color.domain([
        d3.min(pets, function(d) {return d[selectID];}),
        d3.max(pets, function(d) {return d[selectID];})
    ]);


    // Draw map
    var choroMap = svg.selectAll(".zip")
        .data(map.features)
        .attr("class", "zip");

    // Exit old map colors
    choroMap.exit().remove();

    // Set up paths
    choroMap.enter()
        .append("path")
        .attr("class", "zip")
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide)
        .on('click', function(d) {
            updateDetails(d);
        })


        // Update map
        .merge(choroMap)
        .transition()
        .duration(800)
        .attr("d", path)
        .style("fill", function(d) {
            var value = d.properties[selectID];
            if (value) {
                return color(value);
            } else {
                return "#dbdbdb";
            }
        });


    // Remove old legend
    d3.selectAll("g.legend").remove();

    // Add legend
    var newData = [];
    var sectionWidth = Math.floor(legend_width / divisions);

    for (var i=0; i < legend_width; i+= sectionWidth ) {
        newData.push(i);
    }

    var range_low = d3.min(pets, function(d) {return d[selectID];}),
        range_high= d3.max(pets, function(d) {return d[selectID];});

    var colorScaleLin = d3.scaleLinear()
        .domain([0, newData.length-1])
        .interpolate(d3.interpolateLab)
        .range(["#b7e0d8", "#34638b"]);

    legend = svg.selectAll("g.legend")
        .data(newData)
        .enter().append("g")
        .attr("class", "legend");

    legend.append('rect')
        .attr("x", function(d) { return d + 300; })
        .attr("y", height-50)
        .attr("height", 10)
        .attr("width", sectionWidth)
        .attr('fill', function(d, i) { return colorScaleLin(i)});

    legend.append("text")
        .text(function(){return formatComma(range_low);})
        .attr("transform","translate(298,546)");
    legend.append("text")
        .text(function(){return formatComma(range_high);})
        .attr("transform","translate("+(legend_width+275)+",546)");
    legend.append("text")
        .text(function(){return configs[index].tip;})
        .attr("transform","translate("+((legend_width/2)+260)+",538)");


    // Map title
    $("#choro-title").text(configs[index].title);

}

function updateDetails(data) {

    $('#zip-details').removeClass('hide');

    $("#zip").text(function() {
        return "Zip Code: " + data.properties["ZCTA5CE10"]
    });
    $("#tot-pets").text(formatComma(data.properties["total_all_cnt"]));
    $("#tot-cats").text(formatComma(data.properties["cat_all_cnt"]));
    $("#tot-dogs").text(formatComma(data.properties["dog_all_cnt"]));
    $("#pop").text(formatComma(data.properties["Population"]));
    $("#income").text(formatCurrency(data.properties["Med_HH_Inc"]));
    $("#age").text(data.properties["Med_Age"]);

}


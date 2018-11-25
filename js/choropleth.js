

// Initialize data
var map;
var pets;
var neighborhoods;


// Filter shelters to those that fall on map
var shelters = points.filter(function(el) {
    return el.latlng[1] < -122.24;
});


// --> CREATE SVG DRAWING AREA
var width = 600,
    height = 600;

var svg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);


// Set up map
var projection = d3.geoAlbersUsa()
    .translate([width*40.9, height*27.28])
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
    // Get configs index for tooltip and map title
    index = configs.findIndex(function(config) {
        return config.key === selectID;
    });
    // Decide which number format to use in tooltip and legend
    if (selectID === "cat_all_cnt") {
        format = formatComma;
    } else if (selectID === "dog_all_cnt") {
        format = formatComma;
    } else if (selectID === "dog_share") {
        format = formatPercent;
    } else if (selectID === "dog_mixed_explicit_perc") {
        format = formatPercent;
    } else if (selectID === "cat_mixed_explicit_perc") {
        format = formatPercent;
    } else if (selectID === "dog_median_size") {
        format = formatLb;
    }
    updateBlurb();
    updateChoropleth();
});


// Format functions
var formatComma = d3.format(","),
    formatCurrency = function(d) { return "$" + d3.format(",.0f")(d); },
    formatPercent = d3.format(",.1%"),
    formatLb = function(d) {
        return d + " lb";
    },
    format = formatComma;

var formatReal = function(d) {
    if (isNaN(d)) {
        return "undefined";
    } else {
        return format(d);
    }
};



// Data configurations: data keys, tooltips and map titles
var configs = [
    //{ key: "total_all_cnt", tip: "Number of Pets", title: "Total Number of Pets Per Zip Code in Seattle" },
    { key: "cat_all_cnt", tip: "Number of Cats", title: "Total Number of Cats Licensed Per Zip Code in Seattle" },
    { key: "dog_all_cnt", tip: "Number of Dogs", title: "Total Number of Dogs Licensed Per Zip Code in Seattle" },
    { key: "dog_share", tip: "Percent Dogs (vs Cats)", title: "Percentage of Dogs (vs Cats) Per Zip Code in Seattle" },
    { key: "dog_mixed_explicit_perc", tip: "Percent Mixed Breed Dogs", title: "Percentage of Mixed Breed Dogs Per Zip Code in Seattle" },
    { key: "cat_mixed_explicit_perc", tip: "Percent Mixed Breed Cats", title: "Percentage of Mixed Breed Cats Per Zip Code in Seattle" },
    { key: "dog_median_size", tip: "Median Dog Weight (lb)", title: "Median Dog Weight Per Zip Code in Seattle" },
];
var index = configs.findIndex(function(config) {
    return config.key === selectID;
});



// Tool tip
var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return "Zip Code: " + d.properties["ZCTA5CE10"] + "<br/>"  + configs[index].tip + ": " + formatReal(d.properties[selectID]) });

svg.call(tool_tip);








// Load data asynchronously
queue()
    .defer(d3.json,"data/zip-codes.geo.json")
    //.defer(d3.csv,"data/zip_stats_filtered.csv")
    .defer(d3.csv,"data/Zip_Stats.csv")
    .defer(d3.csv,"data/Census_PopFacts_WA_edit.csv")
    .defer(d3.csv,"data/seattle_neighborhoods.csv")
    .await(createVis);


// Create the map
function createVis(error, mapJson, petData, demData, hoodData) {

    if(error) { console.log(error); }


    // Convert strings to numeric for both CSVs
    petData.forEach(function(d){
        d.cat_all_cnt =+ d.cat_all_cnt;
        d.dog_all_cnt =+ d.dog_all_cnt;
        d.total_all_cnt =+ d.total_all_cnt;
        d.dog_share =+ d.dog_share;
        d.dog_mixed_explicit_perc =+ d.dog_mixed_explicit_perc;
        d.cat_mixed_explicit_perc =+ d.cat_mixed_explicit_perc;
        d.dog_median_size =+ d.dog_median_size;
    });
    demData.forEach(function(d){
        d.Population =+ d.Population;
        d.Med_Age =+ d.Med_Age;
        d.Med_HH_Inc =+ d.Med_HH_Inc;
    });



    // Merge pets and demographic data
    for (var i = 0; i < petData.length; i++) {
        for (var j = 0; j < demData.length; j++) {
            if (petData[i].zip_code === demData[j].Area_Code) {
                petData[i].Population = demData[j].Population;
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
                mapJson.features[j].properties.dog_share = petData[i].dog_share;
                mapJson.features[j].properties.dog_mixed_explicit_perc = petData[i].dog_mixed_explicit_perc;
                mapJson.features[j].properties.cat_mixed_explicit_perc = petData[i].cat_mixed_explicit_perc;
                mapJson.features[j].properties.dog_median_size = petData[i].dog_median_size;
                mapJson.features[j].properties.Population = petData[i].Population;
                mapJson.features[j].properties.Med_Age = petData[i].Med_Age;
                mapJson.features[j].properties.Med_HH_Inc = petData[i].Med_HH_Inc;
                break;

            }
        }
    }



    map = mapJson;


    neighborhoods = hoodData;



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


    // Add points for shelters
    svg.selectAll("circle")
        .data(shelters)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) {
            return projection([d.latlng[1], d.latlng[0]])[0];
        })
        .attr("cy", function(d) {
            return projection([d.latlng[1], d.latlng[0]])[1];
        })
        .attr("r", 3)
        .style("fill", "#fae655")
        .style("stroke", "#000000")
        .style("stroke-width", 0.75)
        .append("title")
        .text("Animal Shelter");



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
        .attr("y", 530)
        .attr("height", 10)
        .attr("width", sectionWidth)
        .attr('fill', function(d, i) { return colorScaleLin(i)});

    legend.append("text")
        .text(function(){return formatReal(range_low);})
        .attr("transform","translate(300,526)")
        .attr("text-anchor", "start");
    legend.append("text")
        .text(function(){return formatReal(range_high);})
        .attr("transform","translate("+(legend_width+300)+",526)")
        .attr("text-anchor", "end");
    legend.append("text")
        .attr("class", "legend-title")
        .text(function(){return configs[index].tip;})
        .attr("transform","translate("+((legend_width/2)+300)+",555)")
        .attr("text-anchor", "middle");


    // Map title
    $("#choro-title").text(configs[index].title);

}

function updateDetails(data) {

    // get current zip for neighborhoods
    var currentZip = neighborhoods.findIndex(function(hood) {
        return hood.zip_code === data.properties["ZCTA5CE10"];
    });

    // show zip code detail table
    //$('#zip-details').removeClass('hide');

    // populate table with current zip data
    $("#zip").text(function() {
        return "Zip Code: " + data.properties["ZCTA5CE10"]
    });
    $("#neighborhoods").text(function(d) {
        return neighborhoods[currentZip].neighborhoods;
    });
    $("#tot-pets").text(formatComma(data.properties["total_all_cnt"]));
    $("#tot-cats").text(formatComma(data.properties["cat_all_cnt"]));
    $("#tot-dogs").text(formatComma(data.properties["dog_all_cnt"]));
    $("#mix-dogs").text(formatPercent(data.properties["dog_mixed_explicit_perc"]));
    $("#dog-weight").text(formatLb(data.properties["dog_median_size"]));
    $("#mix-cats").text(formatPercent(data.properties["cat_mixed_explicit_perc"]));
    $("#pop").text(formatComma(data.properties["Population"]));
    $("#income").text(formatCurrency(data.properties["Med_HH_Inc"]));
    $("#age").text(data.properties["Med_Age"]);

}

function updateBlurb() {

    if (selectID === "cat_all_cnt") {
        $('#dog_all').addClass('hide');
        $('#dog_v_cat').addClass('hide');
        $('#dog_mixed').addClass('hide');
        $('#cat_mixed').addClass('hide');
        $('#dog_size').addClass('hide');
        $('#cat_all').removeClass('hide');
    } else if (selectID === "dog_share") {
        $('#dog_all').addClass('hide');
        $('#cat_all').addClass('hide');
        $('#dog_mixed').addClass('hide');
        $('#cat_mixed').addClass('hide');
        $('#dog_size').addClass('hide');
        $('#dog_v_cat').removeClass('hide');
    } else if (selectID === "dog_mixed_explicit_perc") {
        $('#dog_all').addClass('hide');
        $('#cat_all').addClass('hide');
        $('#dog_v_cat').addClass('hide');
        $('#cat_mixed').addClass('hide');
        $('#dog_size').addClass('hide');
        $('#dog_mixed').removeClass('hide');
    } else if (selectID === "cat_mixed_explicit_perc") {
        $('#dog_all').addClass('hide');
        $('#cat_all').addClass('hide');
        $('#dog_v_cat').addClass('hide');
        $('#dog_mixed').addClass('hide');
        $('#dog_size').addClass('hide');
        $('#cat_mixed').removeClass('hide');
    } else if (selectID === "dog_median_size") {
        $('#dog_all').addClass('hide');
        $('#cat_all').addClass('hide');
        $('#dog_v_cat').addClass('hide');
        $('#dog_mixed').addClass('hide');
        $('#cat_mixed').addClass('hide');
        $('#dog_size').removeClass('hide');
    } else if (selectID === "dog_all_cnt") {
        $('#dog_size').addClass('hide');
        $('#cat_all').addClass('hide');
        $('#dog_v_cat').addClass('hide');
        $('#dog_mixed').addClass('hide');
        $('#cat_mixed').addClass('hide');
        $('#dog_all').removeClass('hide');
    }

}



// Initialize data
var map;
var pets;
var neighborhoods;


// Filter shelters to those that fall on map
var shelters = points.filter(function(el) {
    return el.latlng[1] < -122.24;
});



// Set up map
// Access token
var mapboxAccessToken = "pk.eyJ1IjoiYmNhbGxhbmRlciIsImEiOiJjanAzZWRvNWUwaDQ4M2tvYjZsYzdkdTY1In0.YrtqRgZBopVoGFYNMNUd4w";

// Direct to correct folder for leaflet images
L.Icon.Default.imagePath = 'css/images/';

// Draw map
var choroMap = L.map('choropleth').setView([47.606209, -122.332069], 10);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(choroMap);

// Initialize map layers
var zipsLayer;
var animalShelters;

// Initialize legend
var legend_width = 200,
    divisions = 100;
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (choroMap) {var div = L.DomUtil.create('div', 'legend'); return div};
legend.onRemove = function (choroMap) {delete choroMap.legend;};

// Initialize info control box
var info = L.control();
info.onAdd = function (choroMap) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props["ZCTA5CE10"] + '</b><br />' + configs[index].tip + ": " + formatReal(props[selectID])
        : 'Hover over a zipcode');
};
info.onRemove = function (choroMap) {delete choroMap.info;};



// Color scale
var color = d3.scaleLinear()
    .range(["#b7e0d8", "#34638b"])
    .interpolate(d3.interpolateLab);



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

    // Update/remove section and map elements
    updateBlurb();
    choroMap.removeLayer(zipsLayer);
    choroMap.removeLayer(animalShelters);
    choroMap.removeControl(legend);
    choroMap.removeControl(info);

    // Update map
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



// Tool tip - Used on old map
//var tool_tip = d3.tip()
    //.attr("class", "d3-tip")
    //.offset([-8, 0])
    //.html(function(d) { return "Zip Code: " + d.properties["ZCTA5CE10"] + "<br/>"  + configs[index].tip + ": " + formatReal(d.properties[selectID]) });
//svg.call(tool_tip);






// Load data asynchronously
queue()
    .defer(d3.json,"data/zip-codes.geo.json")
    .defer(d3.csv,"data/Zip_Stats.csv")
    .defer(d3.csv,"data/Census_PopFacts_WA_edit.csv")
    .defer(d3.csv,"data/seattle_neighborhoods.csv")
    .await(initVis);


// Prep data
function initVis(error, mapJson, petData, demData, hoodData) {

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


    // Add choropleth layer
    zipsLayer = L.geoJson(map, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(choroMap);


    // Add info control box
    info.addTo(choroMap);


    // Add shelters
    animalShelters = L.layerGroup().addTo(choroMap);
    for (var i=0; i < points.length; i++) {

        var lon = points[i].latlng[1];
        var lat = points[i].latlng[0];
        var popupText = "Animal Shelter";


        var markerLocation = new L.LatLng(lat, lon);
        var shelter = new L.Marker(markerLocation);
        animalShelters.addLayer(shelter);

        shelter.bindPopup(popupText);
    }



    // Set up legend contents
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

    // Add legend control box
    legend.addTo(choroMap);

    // Remove old legend svg
    d3.selectAll(".key").remove();


    // Draw svg for legend within legend control box
    var svg = d3.select(".legend.leaflet-control").append("svg")
        .attr("id", 'legend')
        .attr("width", 240)
        .attr("height", 50);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(10,16)");

    g.selectAll("rect")
        .data(newData)
        .enter().append("rect")
        .attr("height", 10)
        .attr("x", function(d) { return d + 10; })
        .attr("y", 5)
        .attr("width", sectionWidth)
        .style("fill", function(d, i) { return colorScaleLin(i)});

    g.append("text")
        .text(function(){return formatReal(range_low);})
        .attr("transform","translate(10,25)")
        .attr("text-anchor", "start")
        .style("fill", "black");
    g.append("text")
        .text(function(){return formatReal(range_high);})
        .attr("transform","translate("+(legend_width+10)+",25)")
        .attr("text-anchor", "end")
        .style("fill", "black");
    g.append("text")
        .attr("class", "legend-title")
        .text(function(){return configs[index].tip;})
        .attr("transform","translate("+((legend_width/2)+10)+",0)")
        .attr("text-anchor", "middle")
        .style("fill", "black");




    // Map title
    $("#choro-title").text(configs[index].title);

}



// Map functions
// Color for choropleth layer
function style(features) {
    return {
        fillColor: color(features.properties[selectID]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Highlight function on hover
function highlightFeature(e) {
    var layer = e.target;


    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

// Reset highlight
function resetHighlight(e) {
    zipsLayer.resetStyle(e.target);
    info.update();
}

// Master function for zip code layer events
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: updateDetails

    });
}

// Function to update zip code details table
function updateDetails(e) {

    var layer = e.target;

    // get current zip for neighborhoods
    var currentZip = neighborhoods.findIndex(function(hood) {
        return hood.zip_code === layer.feature.properties["ZCTA5CE10"];
    });

    // show zip code detail table
    //$('#zip-details').removeClass('hide');

    // populate table with current zip data
    $("#zip").text(function() {
        return "Zip Code: " + layer.feature.properties["ZCTA5CE10"]
    });
    $("#neighborhoods").text(function(d) {
        return neighborhoods[currentZip].neighborhoods;
    });
    $("#tot-pets").text(formatComma(layer.feature.properties["total_all_cnt"]));
    $("#tot-cats").text(formatComma(layer.feature.properties["cat_all_cnt"]));
    $("#tot-dogs").text(formatComma(layer.feature.properties["dog_all_cnt"]));
    $("#mix-dogs").text(formatPercent(layer.feature.properties["dog_mixed_explicit_perc"]));
    $("#dog-weight").text(formatLb(layer.feature.properties["dog_median_size"]));
    $("#mix-cats").text(formatPercent(layer.feature.properties["cat_mixed_explicit_perc"]));
    $("#pop").text(formatComma(layer.feature.properties["Population"]));
    $("#income").text(formatCurrency(layer.feature.properties["Med_HH_Inc"]));
    $("#age").text(layer.feature.properties["Med_Age"]);

}

// Function to update blurb
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


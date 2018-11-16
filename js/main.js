/* main JS file */
//globalData = '';
//console.log("Hello JS world!");
//inspiration and some code from:
// "D3 + Leaflet"
// http://bl.ocks.org/1Cr18Ni9/d72b6ba95285b80fe4c7498e784a8e0c

//these are locations of pet adoption sites/stores (see data/adoptionSites.csv for details)
//the 'achieve' part is legacy from the example I was basing this on...could be used for other purposes related to pet adoption? 
var points = [
    {latlng: [	47.638167	,	-122.3766	],  achieve: 0.34},
    {latlng: [	47.572181	,	-122.37051	],  achieve: 0.34},
    {latlng: [	47.666579	,	-122.3172	],  achieve: 0.34},
    {latlng: [	47.57586	,	-122.333553	],  achieve: 0.34},
    {latlng: [	47.724237	,	-122.343043	],  achieve: 0.34},
    {latlng: [	47.718049	,	-122.295615	],  achieve: 0.34},
    {latlng: [	47.75618	,	-122.164246	],  achieve: 0.34},
    {latlng: [	47.580758	,	-122.165425	],  achieve: 0.34},
    {latlng: [	47.714761	,	-122.34486	],  achieve: 0.34},
    {latlng: [	47.575828	,	-122.33377	],  achieve: 0.34},
    {latlng: [	47.718049	,	-122.295615	],  achieve: 0.34},
    {latlng: [	47.755534	,	-122.232281	],  achieve: 0.34},
    {latlng: [	47.623993	,	-122.356531	],  achieve: 0.34},
    {latlng: [	47.858855	,	-122.292621	],  achieve: 0.34}
];

var dogIconBase = L.Icon.extend({
    options: {

        iconSize:     [30, 30], // size of the icon
        iconAnchor:   [15, 0], // point of the icon which will correspond to marker's location

    }
});

var dogIcon = new dogIconBase({iconUrl: 'img/dog.png'});

var pointsGroup = L.layerGroup();
points.forEach(function(d){

    // L.marker([47.39707,8.54942],{icon: greenIcon}).addTo(map)
    //     .bindPopup('A pretty CSS3 popup. &lt;br&gt; Easily customizable.');

    // binding data to marker object's option
    L.marker(d.latlng,{icon: dogIcon},{ achieve: d.achieve })
        //.on("mouseover", onMouseOver)
        //.on("mouseout", onMouseOut)
        .addTo(pointsGroup);
});

var layer1 = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        detectRetina: true,
        attribution: "&copy; " + "<a href='http://openstreetmap.org'>OpenStreetMap</a>" + " Contributors"
    }),
    layer2 = L.tileLayer("http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png", {
        attribution: "Thunderforest"
    }),
    layer3 = L.tileLayer.wms("http://basemap.nationalmap.gov/ArcGIS/services/USGSImageryTopo/MapServer/WMSServer", {
        layers: "0",
        format: "image/png",
        transparent: false,
        attribution: "USGS"
    });

var baseLayers = {
        "osm": layer1,
        "thunderforest": layer2
    },
    subLayers = { "USGS": layer3, "Points": pointsGroup };

var map = L.map("map", {
    center: [47.7, -122.3],
    zoom: 10,
    layers: [layer1, pointsGroup]
});

L.control.layers(baseLayers, subLayers, {position: "topright"}).addTo(map);


//mouseover not working due to something in the tooltips

// function onMouseOver(e){
//     var point = map.latLngToContainerPoint(e.latlng);
//     var tooltip = d3.select(map.getContainer())
//     //var tooltip = d3.select(this.getContainer())
//         .append("div")
//         .attr("class", "tooltip")
//         // Calculating according to marker and tooltip size
//         .style({ left: point.x - 40 + "px", top: point.y - 80 - 41 + "px" })
//         .node();
//     getPie(tooltip, e.target.options.achieve);
// }
// function onMouseOut(e){
//     d3.select(map.getContainer()).select(".tooltip").remove();
// }
// function getPie(node, value){
//     var size = 70;
//     var arc = d3.svg.arc().outerRadius(size / 2).innerRadius(size / 3),
//         pie = d3.layout.pie().sort(null);
//     d3.select(node).append("svg")
//         .attr({ width: size, height: size })
//         .append("g")
//         .attr("transform", "translate(" + [size / 2, size / 2] + ")")
//         .call(function(s){
//             s.append("text")
//                 .text(d3.format(".2p")(value))
//                 .style("font", "12px")
//                 .attr({ "text-anchor": "middle", "alignment-baseline": "central" });
//         })
//         .selectAll("path")
//         .data(pie([value, 1 - value]))
//         .enter()
//         .append("path")
//         .attr({
//             d: arc,
//             fill: function(d,i){ return i ? "gray" : "red"; }
//         });
// }


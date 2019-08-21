function createMap(quakeMarkers) {

  // Create the tile layer that will be the background of our map
  var satMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create a light layer
  var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
  
  // Create a dark layer
  var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Create an outdoor layer
  var outMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Add a plate layer that we will add to using the geoJson
  var plateLayer = new L.LayerGroup();

  // Add Fault lines data
  d3.json(platesLink, function(plateData) {
    // Create a layer with the geoJson function
    L.geoJson(plateData, {
        color: "blue",
        weight: 2
      })
      .addTo(plateLayer);
    });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Satellite": satMap,
    "Light"    : lightMap,
    "Dark"     : darkMap,
    "Outdoor"  : outMap
  };

  // Create an overlayMaps object to hold the earthquakes layer
  var overlayMaps = {
    "Earthquakes": quakeMarkers,
    "Tectonic Plates": plateLayer
  };

  // Create the map object with options
  var myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [satMap, quakeMarkers]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legent and add it to the map
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
  
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 2, 3, 4, 5],
      labels = ['1','2','3','4','5+'];
  
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
  legend.addTo(myMap);

}

function getColor(d) {
  return d > 5  ? '#bd0026' :
         d > 4  ? '#f03b20' :
         d > 3  ? '#fd8d3c' :
         d > 2  ? '#fecc5c' :
          '#ffffb2';
}

function getRadius(d){
  calcRadius = 10000 * d;
  return calcRadius;
}

function createMarkers(response){
  
    // Create an array to hold the markers for each earthquake.
    var quakeMarkers = [];
  
    // Pull the entries from the geojson
    var quakes = response.features;

    // Loop through individual entries, determine if they are a quake, and pick off important data.
    for (var i = 0; i < quakes.length; i++) {

        var quake = quakes[i];

        // Check to see if this was an earthquake
        if (quakes[i].properties.type === 'earthquake'){
          
            // Create a marker that will go on the earthquake lat/long location.
            // Set the circle radius to be proportional to the magnitude of the earthquake.
            markerRadius = getRadius(quake.properties.mag);

            // Set the color
            markerColor = getColor(quake.properties.mag);

            // pull the date from the timestamp
            quakeDate = new Date(quake.properties.time);

            var marker = L.circle([quake.geometry.coordinates[1],quake.geometry.coordinates[0]], {
              radius: markerRadius,
              color: markerColor,
              fillOpacity: 0.75
            }).bindPopup("Date:" + quakeDate + "<br>Magnitude: " + quake.properties.mag);

          quakeMarkers.push(marker);
        }
        
    }

  
  // Create a layer group made from the bike markers array, pass it into the createMap function
  createMap(L.layerGroup(quakeMarkers));
}



// URL for all earthquakes in the past week
weekURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// URL for tectonic plates data
platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json(weekURL, createMarkers);
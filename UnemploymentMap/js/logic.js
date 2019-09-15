
// URL for county lines data
countyLink2018 = "CountiesPlusUnemp2018.geojson";
countyLink2017 = "CountiesPlusUnemp2017.geojson";
countyLink2016 = "CountiesPlusUnemp2016.geojson";
countyLink2015 = "CountiesPlusUnemp2015.geojson";
countyLink2014 = "CountiesPlusUnemp2014.geojson";
countyLink2013 = "CountiesPlusUnemp2013.geojson";

// URL for state lines
stateLink = "gz_2010_us_040_00_500k.json";

// Center of the map we will create (middle of continental US)
centerLoc = [39.82, -98.58];


// Function that will determine the color of a county based on its unemployment rate
function getColor(d) {
  return d > 9  ? '#800026' :
         d > 8   ? '#bd0026' :
         d > 6   ? '#e31a1c' :
         d > 5   ? '#fc4e2a' :
         d > 4   ? '#fd8d3c' :
         d > 3   ? '#feb24c' :
         d > 2   ? '#fed976' :
         d > 1   ? '#ffeda0' :
         d > 0   ? '#ffffcc' :
         '#gray' 
}
function getColor2(d) {
  return d > 9  ? '#543005' :
         d > 8   ? '#8c510a' :
         d > 7   ? '#bf812d' :
         d > 6   ? '#dfc27d' :
         d > 5   ? '#f6e8c3' :
         d > 4   ? '#c7eae5' :
         d > 3   ? '#80cdc1' :
         d > 2   ? '#35978f' :
         d > 1   ? '#01665e' :
         d > 0   ? '#003c30' :
         "#gray"
}

function getColor3(d) {
  return d > 9  ? '#a50026' :
         d > 8   ? '#d73027' :
         d > 7   ? '#f46d43' :
         d > 6   ? '#fdae61' :
         d > 5   ? '#fee08b' :
         d > 4   ? '#d9ef8b' :
         d > 3   ? '#a6d96a' :
         d > 2   ? '#66bd63' :
         d > 1   ? '#1a9850' :
         d > 0   ? '#006837' :
         "#lightgray"
}

// Create basic US map
var usmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

// Add a layer for state outlines
var stateLayer = new L.LayerGroup();
var geoJson;

// Pull in the state geojson file
d3.json(stateLink, function(stateData){

    feature = stateData.features;
    //console.log(feature);

    // Add a layer with the county outlines.
    geoJson = L.geoJson(stateData,{

      // Style for each feature (in this case a neighborhood)
      style: function(feature) {
        return {
          color: "black",
          fillOpacity : 0,
          weight: 1
          }
      },

    }).addTo(stateLayer);
});



// Add a layer for the county boundaries
var countyLayer2018 = new L.LayerGroup();
var countyLayer2017 = new L.LayerGroup();
var countyLayer2016 = new L.LayerGroup();
var countyLayer2015 = new L.LayerGroup();
var countyLayer2014 = new L.LayerGroup();
var countyLayer2013 = new L.LayerGroup();


function yearLayers(year,countyLink,countyLayer){
  
  // Pull in the county geojson file
  d3.json(countyLink, function(countyData){

    feature = countyData.features;
    //console.log(feature);

    // Add a layer with the county outlines.
    geoJson = L.geoJson(countyData,{

      // Style for each feature (in this case a neighborhood)
      style: function(feature) {
        return {
          color: "white",
          // Call the chooseColor function to decide which color to color each county (color based on unemployment rate)
          fillColor: getColor3(feature.properties.UnemploymentRate),
           fillOpacity: 0.75,
          weight: 1
          }
      },

      // Called on each feature
      onEachFeature: function(feature, layer) {

        // Setting various mouse events to change style when different events occur
        layer.on({
          // On mouse over, make the feature (neighborhood) more visible
          mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.9
            });
          },
          // Set the features style back to the way it was
          mouseout: function(event) {
            geoJson.resetStyle(event.target);
          }
        });
        // Giving each feature a pop-up with information about that specific feature
        layer.bindPopup("<h3>" + feature.properties.NAME +', ' + feature.properties.StateAbbr + ` ${year}` +
                        "</h3><p>Workforce Size: " + parseInt(feature.properties.LaborForce).toLocaleString() + 
                        "<br>Number Employed: " + parseInt(feature.properties.Employed).toLocaleString() + 
                        "<br>Number Unemployed: " + parseInt(feature.properties.Unemployed).toLocaleString() + 
                        "<br>Unemployement Rate: " + feature.properties.UnemploymentRate + "</p>");
    
      }
    }).addTo(countyLayer);

  });

}
yearLayers(2018,countyLink2018,countyLayer2018);
yearLayers(2017,countyLink2017,countyLayer2017);
yearLayers(2016,countyLink2016,countyLayer2016);
yearLayers(2015,countyLink2015,countyLayer2015);
yearLayers(2014,countyLink2014,countyLayer2014);
yearLayers(2013,countyLink2013,countyLayer2013);

// Create an overlayMaps object to hold the earthquakes layer
var baseMaps = {
  "Unemployment 2013"    : countyLayer2013,
  "Unemployment 2014"    : countyLayer2014,
  "Unemployment 2015"    : countyLayer2015,
  "Unemployment 2016"    : countyLayer2016,
  "Unemployment 2017"    : countyLayer2017,
  "Unemployment 2018"    : countyLayer2018
};

// Create an overlayMaps object to hold the earthquakes layer
var overlayMaps = {
  "State Borders"    : stateLayer
};
 
// Create the map object with options
var myMap = L.map("map", {
  center: centerLoc,
  zoom: 4,
  layers: [usmap,countyLayer2013]
});


// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Create a legent and add it to the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {
  
  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    labels = ['1','2','3','4','5', '6', '7', '8', '9+'];
  
  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor3(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
};
legend.addTo(myMap);

var layers = [countyLayer2013,countyLayer2014,countyLayer2015,countyLayer2016,countyLayer2017,countyLayer2018];

function switchYear( {value} ){
  
  layerPlace = parseInt(value)-1;
  newTopLayer(layerPlace);
}

// define addLayer function
function newTopLayer(layerNumber) {
 
  for (var i = 0; i < layers.length; i++) {
    myMap.removeLayer(layers[i]);
  };
  myMap.addLayer(layers[layerNumber]);
  
}

// and the length of said array so that the timer will stop
var arrayLength = layers.length;

// set the counter for the timer
var i = 0;                     

// set the timer delay function to add layers to map, calling function name in HTML button
function gogogo () {           
   setTimeout(function () {    

      // Set the slider to each year in order. It will cause the slider function to execute and move through the years.
      var ranges=document.getElementsByClassName('range-labels')[0].getElementsByTagName("li");
      ranges[i].click();
      
      i++;                     
      if (i < arrayLength) {            
         gogogo();             
      }    
   }, 2000); // delay between layer adds in milliseconds
}
gogogo();


L.control.timelineSlider({
  timelineItems: ["2013", "2014", "2015", "2016", "2017", "2018"],
  extraChangeMapParams: {greeting: "Slide to see change in unemployment over time"}, 
  changeMap: switchYear,
  position: 'bottomleft' })
.addTo(myMap);

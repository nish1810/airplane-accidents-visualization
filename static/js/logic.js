var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});
var layers = {
    FATALITIES: new L.LayerGroup(),
    COMMERCIAL_FLIGHT_FATALITIES: new L.LayerGroup(),
    AIRPORT_FATALITIES: new L.LayerGroup()
};
var myMap = L.map("map-id", {
    center: [30, -60],
    zoom:4,
    layers: [
        layers.FATALITIES
        // layers.COMMERCIAL_FLIGHT_FATALITIES,
        // layers.AIRPORT_FATALITIES
    ]
});
lightmap.addTo(myMap);
var overlays = {
    "All Airplane Accident Fatalities": layers.FATALITIES,
    "Commercial Airline Fatalities": layers.COMMERCIAL_FLIGHT_FATALITIES,
    "Airport Fatalities": layers.AIRPORT_FATALITIES
};
L.control.layers(null, overlays).addTo(myMap);
function colormydot (Fatalities) {
    if (Fatalities >= 1 && Fatalities <= 10) {
        return ("#9BD39F");    
    } else if (Fatalities >= 11 && Fatalities <= 50) {
        return ("#F0DF08");
    } else if (Fatalities >= 51 && Fatalities <= 99) {
        return ("orange");    
    } else if (Fatalities >= 99) {
        return ("red");
    } 
}
// var queryURL = "http://127.0.0.1:5000/fatalities";
d3.json("/fatalities").then(function(airplane_fatalities) {
    airplane_fatalities.forEach (function(element) {
        createFatalityMarkers(element.Fatalities, element.Latitude, element.Longitude, element.Event_Date, element.Location);
        createCarrierMarkers(element.Fatalities, element.Latitude, element.Longitude, element.Air_Carrier, element.Event_Date, element.Location)
    });
    function createFatalityMarkers( Fatalities, Latitude, Longitude, Event_Date, Location ){
        if (Fatalities > 0) {
            let options = {
                radius: Fatalities/10,
                fillOpacity: 0.8,
                stroke: true,
                weight: 1,
                color: colormydot(Fatalities),
                fillColor: colormydot(Fatalities)
            }
            return L.circleMarker( [Latitude, Longitude], options )
                .bindPopup("Event Date: " + Event_Date + "<br>Fatalities: " + Fatalities + "<br>Location: " + Location)
            .addTo(layers.FATALITIES);
        }
    }
    function createCarrierMarkers( Fatalities, Latitude, Longitude, Air_Carrier, Event_Date, Location ){
        if (Fatalities > 0 && Air_Carrier != null) {
                let options = {
                    radius: Fatalities/8,
                    fillOpacity: 0.8,
                    stroke: true,
                    weight: 1,
                    color: colormydot(Fatalities),
                    fillColor: colormydot(Fatalities)
                }
                return L.circleMarker( [Latitude, Longitude], options )
                    .bindPopup("Event Date: " + Event_Date + "<br>Fatalities: " + Fatalities + "<br>Location: " + Location + "<br>Air Carrier: " + Air_Carrier)
                .addTo(layers.COMMERCIAL_FLIGHT_FATALITIES);
        }
    }
});
// var queryURL2 = "http://127.0.0.1:5000/by_airport";
d3.json('by_airport').then(function(airport_airplane_fatalities) {
    airport_airplane_fatalities.forEach (function(element) {
        createAirportMarkers(element.fatalities, element.latitude, element.longitude, element.airport_name, element.city, element.country);
    });
    function createAirportMarkers( fatalities, latitude, longitude, airport_name, city, country ){
        if (fatalities > 0) {
            let options = {
                radius: fatalities/10,
                fillOpacity: 0.8,
                stroke: true,
                weight: 1,
                color: colormydot(fatalities),
                fillColor: colormydot(fatalities)
            }
            return L.circleMarker( [latitude, longitude], options )
                .bindPopup("Airport: " + airport_name + "<br>Location: " + city + ", " + country + "<br>Total Fatalities: " + fatalities)
            .addTo(layers.AIRPORT_FATALITIES);
        }
    }
});
var legend = L.control({position: "bottomright"});
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var legendInfo = 
        "<span style='color:#9BD39F'>&#9673</span> 1-10 fatalities <br> <span style='color:#F0DF08'>&#9673</span> 11-50 fatalities <br> <span style='color:orange'>&#9673</span> 51-99 fatalities <br> <span style='color:red'>&#9673</span> 100 or more fatalities";
    div.innerHTML = legendInfo;
    return div;
};
legend.addTo(myMap);
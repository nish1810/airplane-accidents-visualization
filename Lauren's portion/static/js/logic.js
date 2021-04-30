var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

var layers = {
    FATALITIES: new L.LayerGroup(),
    ALL_ACCIDENTS: new L.LayerGroup(),
    COMMERCIAL_FLIGHT_FATALITIES: new L.LayerGroup()
};

var myMap = L.map("map-id", {
    center: [30, -60],
    zoom:4,
    layers: [
        layers.FATALITIES,
        layers.ALL_ACCIDENTS,
        layers.COMMERCIAL_FLIGHT_FATALITIES
    ]
});

lightmap.addTo(myMap);

var overlays = {
    "All Accidents": layers.ALL_ACCIDENTS,
    "All Airplane Accident Fatalities": layers.FATALITIES,
    "Commercial Airline Fatalities": layers.COMMERCIAL_FLIGHT_FATALITIES
};

L.control.layers(null, overlays).addTo(myMap);



function colormydot (Fatalities) {
    if (Fatalities >= 1 && Fatalities <= 10) {
        return ("green");    
    } else if (Fatalities >= 11 && Fatalities <= 50) {
        return ("yellow");
    } else if (Fatalities >= 51 && Fatalities <= 99) {
        return ("orange");
    } else if (Fatalities >= 99) {
        return ("red");
    }

}


var queryURL = "http://127.0.0.1:5000/fatalities";

d3.json(queryURL).then(function(airplane_fatalities) {

    airplane_fatalities.forEach (function(element) {
        createFatalityMarkers(element.Fatalities, element.Latitude, element.Longitude, element.Event_Date);
        createAllAccidentMarkers(element.Fatalities, element.Latitude, element.Longitude, element.Event_Date);
        createCarrierMarkers(element.Fatalities, element.Latitude, element.Longitude, element.Air_Carrier, element.Event_Date)

    });


    function createFatalityMarkers( Fatalities, Latitude, Longitude, Event_Date ){
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
                .bindPopup("Event Date: " + Event_Date + "<br>Fatalities: " + Fatalities)
            .addTo(layers.FATALITIES);
        }
    }


    function createAllAccidentMarkers( Fatalities, Latitude, Longitude, Event_Date ){
            let options = {
                radius: 0.25,
                fillOpacity: 100,
                color: "blue",
                fillColor: "blue"
            }
        
            return L.circleMarker( [Latitude, Longitude], options )
                .bindPopup("Event Date: " + Event_Date + "<br>Fatalities: " + Fatalities)
            .addTo(layers.ALL_ACCIDENTS);
        
    }


    function createCarrierMarkers( Fatalities, Latitude, Longitude, Air_Carrier, Event_Date ){
        if (Fatalities > 0 && Air_Carrier != null) {
                let options = {
                    radius: Fatalities/8,
                    fillOpacity: 0.8,
                    stroke: true,
                    weight: 1,
                    color: "black",
                    fillColor: "black"
                }
                return L.circleMarker( [Latitude, Longitude], options )
                    .bindPopup("Event Date: " + Event_Date + "<br>Fatalities: " + Fatalities + "<br>Air Carrier: " + Air_Carrier)
                .addTo(layers.COMMERCIAL_FLIGHT_FATALITIES);
           
        }
    }
});
        

var legend = L.control({position: "bottomright"});
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var legendInfo = 
        "<span style='color:blue'>&#9673</span> 0 fatalities <br> <span style='color:green'>&#9673</span> 1-10 fatalities <br> <span style='color:yellow'>&#9673</span> 11-50 fatalities <br> <span style='color:orange'>&#9673</span> 51-99 fatalities <br> <span style='color:red'>&#9673</span> 100 or more fatalities <br> <span style='color:black'>&#9673</span> Commercial Airline fatalities";

    div.innerHTML = legendInfo;

    return div;
};
legend.addTo(myMap);




window.onload = function () {

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title:{
            text: "Fatalities per flight phase and weather conditions"
        },
        axisY: {
            title: "Number of Fatalities",
            includeZero: true
        },
        legend: {
            cursor:"pointer",
            itemclick : toggleDataSeries
        },
        toolTip: {
            shared: true,
            content: toolTipFormatter
        },
        data: [{
            type: "bar",
            showInLegend: true,
            name: "VMC",
            color: '#DF7970',
            dataPoints: [
                { label:'Approach', y: 1969 },
                { label:'Climb', y: 494 },
                { label:'Cruise', y: 2373 },
                { label: 'Descent', y: 298 },
                { label: 'Go-Around', y: 339 },
                { label: 'Landing', y: 73 },
                { label: 'Maneuvreing', y: 777 },
                { label: 'Other', y: 3 },
                { label: 'Standing', y: 12 },
                { label: 'Take Off', y: 702 },
                { label: 'Taxi', y: 11},
                { label: 'Unknown', y: 91 }
            ]
        },
        {
            type: "bar",
            showInLegend: true,
            name: "IMC",
            color: '#2596be',
            dataPoints: [
                { label:'Approach', y: 2516 },
                        { label:'Climb', y: 1390 },
                        { label:'Cruise', y: 3398 },
                        { label: 'Descent', y: 771 },
                        { label: 'Go-Around', y: 400},
                        { label: 'Landing', y: 529 },
                        { label: 'Maneuvreing', y: 5500 },
                        { label: 'Other', y: 88 },
                        { label: 'Standing', y: 175 },
                        { label: 'Take Off', y: 4640 },
                        { label: 'Taxi', y: 99 },
                        { label: 'Unknown', y: 4092 }
            ]
        }]
    });
    chart.render();
    
    function toolTipFormatter(e) {
        var str = "";
        var total = 0 ;
        var str3;
        var str2 ;
        for (var i = 0; i < e.entries.length; i++){
            var str1 = "<span style= \"color:"+e.entries[i].dataSeries.color + "\">" + e.entries[i].dataSeries.name + "</span>: <strong>"+  e.entries[i].dataPoint.y + "</strong> <br/>" ;
            total = e.entries[i].dataPoint.y + total;
            str = str.concat(str1);
        }
        str2 = "<strong>" + e.entries[0].dataPoint.label + "</strong> <br/>";
        str3 = "<span style = \"color:Tomato\">Total: </span><strong>" + total + "</strong><br/>";
        return (str2.concat(str)).concat(str3);
    }
    
    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }
    
    }
    
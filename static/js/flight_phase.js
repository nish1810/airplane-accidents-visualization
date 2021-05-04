
function renderChart(chartType) {
  document.getElementById("insert-chart").innerHTML = "";
  fetch ("/weather_impact")
  .then(res => res.json())
  .then(data => {
    console.log(data);

    data.map((items, i) => {
      let chartDiv = document.createElement("div");
      chartDiv.id= "chart" + i;
      chartDiv.className = "canvasChart"
      document.getElementById("insert-chart").append(chartDiv);

      
    var chart = new CanvasJS.Chart("chart" + i, {
      animationEnabled: true,
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      title:{
          text: items.FlightPhase
      },
      axisY: {
          title: "Number of Accidents"
      },
      legend:{
        cursor: "pointer",
      },

      data: [{        
          type: chartType,  
          showInLegend: true,
          legendMarkerColor: "grey",
          legendText: " ",
          dataPoints: [      
              { y: items.Fatalities, label: "Fatalities"},
              { y: items.Injuries,  label: "Injuries" },
              { y: items.Uninjured,  label: "Uninjured" },
          ]
      }]
  });
  chart.render();
  })
    })
}

renderChart("column");



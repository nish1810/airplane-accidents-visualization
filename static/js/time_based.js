  window.onload = function() {

    var dataPoints = [];
    var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: "Accidents per Month"
      },
      axisY: {
        title: "Accidents",
        titleFontSize: 24,
        includeZero: true
      },
      data: [{
        type: "line",
        // yValueFormatString: "#,### Accidents",
        dataPoints: dataPoints
      }]
    });
    
    function addData(data) {
      for (var i = 0; i < data.length; i++) {
        dataPoints.push({
          y: data[i].accidents,
          label: data[i].monthname
        });
      }
      chart.render();
    }
    
    $.getJSON("/monthly", addData);
  }


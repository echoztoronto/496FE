
function processData(data, time_year, time_month, time_day) {
    
    lines = data[time_year][time_month][time_day];
    alert(lines);
    return lines;
  }

  function drawGraph(data_lines) {
    new Chart(document.getElementById("line-chart"), {
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        datasets: [{ 
            data: data_lines,
            label: "Africa",
            borderColor: "#3e95cd",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: "Historical Load",
          fontSize: 20       
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display:true,
              labelString: "Time of the day"
            }
          }],
          yAxes: [{
            scaleLabel: {
              display:true,
              labelString: "Load"
            }
          }]
        }  
      }
    });
  }
  
  var folderName = "js/data/historical/"
  var buildingName = "AERL";
  var pathName = folderName.concat(buildingName, ".json");
  var time_year = "2019";
  var time_month = "6";
  var time_day = "1";
  
  
  var fs = $(document).ready(function() {
    $.ajax({
        type: "GET",
        url: pathName ,
        dataType: "json",
        success: function(data) {
          var data_lines = processData(data, time_year, time_month, time_day);
  
          var mychart = drawGraph(data_lines);
        
        mychart.update();
        }
     });
  });
  
  
  

  

var numDays = {
                '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30,
                '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31
              };

var time_year, time_month,  time_day;

function graphFilter(oMonthSel, oDaysSel, oYearSel, oBuildingSel)
{
	var nDays, oDaysSelLgth, opt, i = 1;
	nDays = numDays[oMonthSel[oMonthSel.selectedIndex].value];
	if (nDays == 28 && oYearSel[oYearSel.selectedIndex].value % 4 == 0)
		++nDays;
	oDaysSelLgth = oDaysSel.length;
	if (nDays != oDaysSelLgth)
	{
		if (nDays < oDaysSelLgth)
			oDaysSel.length = nDays;
		else for (i; i < nDays - oDaysSelLgth + 1; i++)
		{
			opt = new Option(oDaysSelLgth + i, oDaysSelLgth + i);
                  	oDaysSel.options[oDaysSel.length] = opt;
		}
	}
	var oForm = oMonthSel.form;
	var month = oMonthSel.options[oMonthSel.selectedIndex].value;
	var day = oDaysSel.options[oDaysSel.selectedIndex].value;
	var year = oYearSel.options[oYearSel.selectedIndex].value;	
  oForm.hidden.value = month + '/' + day + '/' + year;
  
  var buildingName = oBuildingSel.options[oBuildingSel.selectedIndex].value;
  var pathName = "js/data/historical/".concat(buildingName, ".json");


  var fs = $(document).ready(function() {
    $.ajax({
        type: "GET",
        url: pathName ,
        dataType: "json",
        success: function(data) {
          var data_lines = processData(data, year, month, day);
  
          var mychart = drawGraph(data_lines, buildingName, year, month, day);
        
        mychart.update();
        }
      });
  });
}




function processData(data, time_year, time_month, time_day) {
    lines = data[time_year][time_month][time_day];
    return lines;
  }

  function drawGraph(data_lines, buildingName, year, month, day) {
    new Chart(document.getElementById("line-chart"), {
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [{ 
            data: data_lines,
            label: buildingName,
            borderColor: "#3e95cd",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: "Historical Load of ".concat(month, "/", day, "/", year),
          fontSize: 30       
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Time of the day"
            }
          }],
          yAxes: [{
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Load (kW)"
            }
          }]
        }  
      }
    });
  }
  


  
  

  
  
  

function updateGraph() {
  mychart.update();
}
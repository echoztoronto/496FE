
var numDays = {
                '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30,
                '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31
              };

var default_labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

var border_color = {
  '1': "#3e95cd", '2': "#8e5ea2", '3': "#3cba9f"
}


var mychart;
var data_buf = [];

var dataset = {
  "1": {
    'year': '2019', 'month': '1', 'day': '1', 'building': 'AERL'
  },
  "2": {
    'year': '0', 'month': '0', 'day': '0', 'building': '0'
  },

};


function set_data (num, oMonthSel, oDaysSel, oYearSel) {
  console.log("set_data ", num);

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

  dataset[num].month = oMonthSel.options[oMonthSel.selectedIndex].value;
  dataset[num].day = oDaysSel.options[oDaysSel.selectedIndex].value;
  dataset[num].year = oYearSel.options[oYearSel.selectedIndex].value;

  graph_refresh(mychart);
}

function set_building (num, oBuildingSel) {
  console.log("set_building", num);

  dataset[num].building = oBuildingSel.options[oBuildingSel.selectedIndex].value;
  graph_refresh(mychart);
}





function graph_refresh(mychart) {
  console.log("refresh starts ");

  if(mychart != undefined) {
    console.log("destroy");
    mychart.destroy();
  }
  graph_initiate();

  if(dataset[2].building != '0' && dataset[2].year != '0') {
    graph_add(2);
  }
}

function graph_initiate() {

	var month = dataset[1].month;
	var day = dataset[1].day;
	var year = dataset[1].year;	
  var building = dataset[1].building;
  var pathName = "js/data/historical/".concat(building, ".json");

  var fs = $(document).ready(function() {
    $.ajax({
        type: "GET",
        url: pathName ,
        dataType: "json",
        success: function(data) {
          if(valid_data(data, year, month, day)) {
            drawGraph(data[year][month][day], building, year, month, day);
            document.getElementById("selection-notif").innerHTML = " ";
          } 
          else {
            document.getElementById("selection-notif").innerHTML = 
            "Sorry, currently we don't have data for ".concat(building," on ",month,"/",day,"/",year);;
          }
        }
      });
  });
}


function drawGraph(data_lines, buildingName, year, month, day) {
  console.log("drawgraph");

  mychart = new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: default_labels,
      datasets: [{ 
          data: data_lines,
          label: buildingName,
          borderColor: border_color['1'],
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
      legend:{
        labels: {
          fontSize: 18
        }
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
  
function graph_add(num) {

	var month = dataset[num].month;
	var day = dataset[num].day;
	var year = dataset[num].year;	
  var building = dataset[num].building;
  var pathName = "js/data/historical/".concat(building, ".json");

  var fs = $(document).ready(function() {
    $.ajax({
        type: "GET",
        url: pathName ,
        dataType: "json",
        success: function(data) {
          if(valid_data(data, year, month, day)) {
            addData(num, mychart, building, data[year][month][day]);
            document.getElementById("selection-notif").innerHTML = " ";
          } 
          else {
            document.getElementById("selection-notif").innerHTML = 
            "Sorry, currently we don't have data for ".concat(building," on ",month,"/",day,"/",year);
          }
        }
      });
  });
}


function addData(num, mychart, building, data_lines) {
  var new_dataset = { 
    data: data_lines,
    label: building,
    borderColor: border_color[num],
    fill: false
  };
  mychart.data.datasets.push(new_dataset);
  mychart.update(0);
}


// validate if there is data for a specific date
function valid_data(data, year, month, day) {
  if (year in data) {
    if (month in data[year]) {
      if (day in data[year][month]) {
        return true;
      }
    }
  }
  return false;
}

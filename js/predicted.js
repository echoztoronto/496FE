var buildingIDs;     //building name -> building ID
var energyData;      //building ID -> year -> month -> day
var predictedData;   //building ID -> year -> month -> day

// for github page:  url: "/496FE/data/buildingIDs.json" 
// for self testing: url: "../../data/buildingIDs.json",

var fs1 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "/496FE/data/buildingIDs.json", 
      dataType: "json",
      success: function(data) {
        buildingIDs = data;
      }
    });
});

var fs2 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "/496FE/data/UBCEnergy.json",
      dataType: "json",
      success: function(data) {
        energyData = data;
      },
    });
});

var fs3 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "/496FE/data/Predicted.json",
      dataType: "json",
      success: function(data) {
        predictedData = data;
      },
    });
});

//graph variable 
var mychart = new Chart(document.getElementById("bar-chart"), {
  type: 'bar',
  data: {
    labels: default_labels,
    datasets: []
  },
  options: {
    title: {
      display: true,
      text: "Historical Load vs. Predicted Load",
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
      yAxes: [
        {
          id: 'A',
          type: 'linear',
          position: 'left',
          scaleLabel: {
            fontSize: 20,
            display:true,
            labelString: "Load (kW)"
          }
        },
        {
          id: 'B',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            fontSize: 20,
            display:true,
            labelString: "Percentage Error (%)",
          },
          ticks: {
            max: 100,
            min: -100
          }
        }
      ]
    }  
  }
});


var numDays = {
                '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30,
                '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31
              };

var default_labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

var bar_color = {
  '1': "#3e95cd", '2': "#bc5090", '3': "#58508d"
};

var bar_label = {
  '1': "Historical Load", '2': "Predicted Load"
};

var dataset = {
  'year': '2019', 'month': '1', 'day': '1', 'building': 'AERL'
};

var dataset_bool = {
  '1': false, //actual data
  '2': false, //predicted data
};

var dataset_data = {
  "1": [],  //actual data
  "2": [],  //predicted data
  "3": [],  //percentage error
};

//called by choosing a day/month/year
function set_data (oMonthSel, oDaysSel, oYearSel) {
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

  dataset.month = oMonthSel.options[oMonthSel.selectedIndex].value;
  dataset.day = oDaysSel.options[oDaysSel.selectedIndex].value;
  dataset.year = oYearSel.options[oYearSel.selectedIndex].value;

  get_data_from_json();
  update_graph(); 

}

//called by choosing a building
function set_building (oBuildingSel) {
  dataset.building = oBuildingSel.options[oBuildingSel.selectedIndex].value;

  get_data_from_json();
  update_graph(); 
}

function update_graph() {
  if(mychart != undefined) {
    mychart.destroy();
  }
  graph_init();

  //percentage error line
  if(dataset_bool[1]&&dataset_bool[2]) {
    dataset_data[3] = get_percentage_error(dataset_data[1], dataset_data[2]);
    var new_dataset = { 
      data: dataset_data[3],
      label: "Percentage Error",
      borderColor: 'black',
      borderWidth: 2,
      type: 'line',
      fill: false,
      yAxisID: 'B',
    };
    mychart.data.datasets.push(new_dataset);
  }
  
  var i;
  for (i = 1; i < 3; i++) {
    if(dataset_bool[i]) {
      var new_dataset = { 
        data: dataset_data[i],
        label: bar_label[i],
        backgroundColor: bar_color[i],
        fill: false,
        yAxisID: 'A',
      };
      mychart.data.datasets.push(new_dataset);
    }
  }


  mychart.update();
}


//init a new blank graph
function graph_init() {
  mychart = new Chart(document.getElementById("bar-chart"), {
    type: 'bar',
    data: {
      labels: default_labels,
      datasets: []
    },
    options: {
      title: {
        display: true,
        text: "Historical Load vs. Predicted Load",
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
        yAxes: [
          {
            id: 'A',
            type: 'linear',
            position: 'left',
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Load (kW)"
            }
          },
          {
            id: 'B',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Percentage Error (%)",
            },
            ticks: {
              max: 100,
              min: -100
            }
          }
        ]
      }  
    }
  });
}

//access to local json file and find if there are valid data
async function get_data_from_json() {

	var month = dataset.month;
	var day = dataset.day;
	var year = dataset.year;	
  var bID = buildingIDs[dataset.building];

  //actual load
  if(valid_data(energyData, year, month, day, bID)) {
    dataset_bool[1] = true;
    dataset_data[1] = energyData[bID][year][month][day];
    document.getElementById("notif-actual").innerHTML = " ";
  } 
  else {
    dataset_bool[1] = false;
    dataset_data[1] = [];
    document.getElementById("notif-actual").innerHTML = 
    "Sorry, currently we don't have historical data for ".concat(dataset.building," on ",month,"/",day,"/",year);
  }
  
  //predicted load
  if(valid_data(predictedData, year, month, day, bID)) {
    dataset_bool[2] = true;
    dataset_data[2] = predictedData[bID][year][month][day];
    document.getElementById("notif-predicted").innerHTML = " ";
  } 
  else {
    dataset_bool[2] = false;
    dataset_data[2] = [];
    document.getElementById("notif-predicted").innerHTML = 
    "Sorry, currently we don't have predicted data for ".concat(dataset.building," on ",month,"/",day,"/",year);
  }

}


// validate if there is data for a specific date and building ID
function valid_data(data, year, month, day, bID) {
  if(bID in data) {
    if (year in data[bID]) {
      if (month in data[bID][year]) {
        if (day in data[bID][year][month]) {
          return true;
        }
      }
    }
  }
  return false;
}

// calculate percentage error of two data sets
function get_percentage_error(actual, predicted) {
  if(actual.length != predicted.length) {
    console.log("two datasets have different size");
    return [];
  }

  var len = actual.length;
  var i;
  var error = [];
  for (i = 0; i < len; i++) {
    error.push((100*Math.abs(actual[i]-predicted[i])/actual[i]).toFixed(2));
  }

  return error;
}

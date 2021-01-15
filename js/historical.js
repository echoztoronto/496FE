var mychart;
var lock;

var numDays = {
                '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30,
                '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31
              };

var default_labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

var bar_color = {
  '1': "#3e95cd", '2': "#bc5090", '3': "#58508d"
}

var dataset_bool = {
  '1': false, '2': false, '3': false
};

var dataset = {
  "1": {
    'year': '2019', 'month': '1', 'day': '1', 'building': 'AERL'
  },
  "2": {
    'year': '0', 'month': '0', 'day': '0', 'building': '0'
  },
  "3": {
    'year': '0', 'month': '0', 'day': '0', 'building': '0'
  },
};

var dataset_data = {
  "1": [],
  "2": [],
  "3": [],
};

//called by choosing a day/month/year
async function set_data (num, oMonthSel, oDaysSel, oYearSel) {
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

  if (dataset[num].month !== '0' && dataset[num].building !== '0') {
    dataset_bool[num] = true;
    await get_data_from_json(num);
  } else {
    dataset_bool[num] = false;
    dataset_data[num] = [];
  }
}

//called by choosing a building
async function set_building (num, oBuildingSel) {
  dataset[num].building = oBuildingSel.options[oBuildingSel.selectedIndex].value;
  if (dataset[num].month !== '0' && dataset[num].building !== '0') {
    dataset_bool[num] = true;
    await get_data_from_json(num);
  } else {
    dataset_bool[num] = false;
    dataset_data[num] = [];
  }
}

async function update_graph() {
  console.log("update..........."); //

  if(mychart != undefined) {
    mychart.destroy();
  }

  graph_init();
  
  if(has_valid_dataset()) {
    var i;
    for (i = 1; i < 4; i++) {
      if(dataset_bool[i]) {
        console.log(i); //
        console.log(dataset_data[i]);//

        var new_dataset = { 
          data: dataset_data[i],
          label: dataset[i].building,
          backgroundColor: bar_color[i],
          fill: false
        };
        console.log(new_dataset); //
        mychart.data.datasets.push(new_dataset);
      }
  }

  mychart.update();

  }
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
        text: "Historical Load",
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

//access to local json file and find if there are valid data
async function get_data_from_json(num) {

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
            dataset_bool[num] = true;
            dataset_data[num] = data[year][month][day];
            document.getElementById("selection-notif").innerHTML = " ";
          } 
          else {
            dataset_bool[num] = false;
            document.getElementById("selection-notif").innerHTML = 
            "Sorry, currently we don't have data for ".concat(building," on ",month,"/",day,"/",year);
          }
        }
      });
  });
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

function has_valid_dataset() {
  var i;
  for (i = 1; i < 4; i++) {
    if(dataset_bool[i]) {return true;}
  }
  return false;
}
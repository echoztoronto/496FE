var buildingIDs;     //building name -> building ID
var energyData;      //building ID -> year -> month -> day
var mychart = null; 

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
  'year': '2015', 'month': '1', 'day': '1', 'building': 'AERL'
  },
  "2": {
  'year': '2015', 'month': '', 'day': '', 'building': ''
  },
  "3": {
  'year': '2015', 'month': '', 'day': '', 'building': ''
  },
};

var dataset_data = {
  "1": [],
  "2": [],
  "3": [],
};

var selection_valid = {
  '1': true, '2': false, '3': false  
}

let dev_mode = false;
let local_url = '';
if(dev_mode) local_url = "../../";
else local_url = "/496FE/";

var fs1 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: local_url + "data/buildingIDs.json",
      dataType: "json",
      success: function(data) {
        buildingIDs = data;
      }
    });
});

var fs2 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: local_url + "data/UBCEnergy.json",
      dataType: "json",
      success: function(data) {
        energyData = data;
        get_data_from_json(1);
        update_graph();
      },
      error: function(xhr, desc, err) {
        console.log(xhr);
        console.log("Details: " + desc + "\nError:" + err);
      }
    });
});


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

  if (dataset[num].day !== '' && dataset[num].month !== '' && dataset[num].building !== '') {
    dataset_bool[num] = true;
    await get_data_from_json(num);
    update_graph(); //test
  } else {
    dataset_bool[num] = false;
    dataset_data[num] = [];
  }
}

//called by choosing a building
async function set_building (num, oBuildingSel) {
  dataset[num].building = oBuildingSel.options[oBuildingSel.selectedIndex].value;
  if (dataset[num].day !== '' && dataset[num].month !== '' && dataset[num].building !== '') {
    dataset_bool[num] = true;
    await get_data_from_json(num);
    update_graph(); //test
  } else {
    dataset_bool[num] = false;
    dataset_data[num] = [];
  }
}

async function update_graph() {

  if(mychart != undefined) {
    mychart.destroy();
  }

  graph_init();
  
  if(has_valid_dataset()) {
    var i;
    for (i = 1; i < 4; i++) {
      if(dataset_bool[i]) {

        var new_dataset = { 
          data: dataset_data[i],
          label: dataset[i].building,
          backgroundColor: bar_color[i],
          fill: false
        };
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
  var bID = buildingIDs[dataset[num].building];

  if(valid_data(energyData, year, month, day, bID)) {
    dataset_bool[num] = true;
    dataset_data[num] = energyData[bID][year][month][day];
    document.getElementById("selection-notif").innerHTML = " ";
  } 
  else {
    dataset_bool[num] = false;
    document.getElementById("selection-notif").innerHTML = 
    "Sorry, currently we don't have data for ".concat(dataset[num].building," on ",month,"/",day,"/",year);
  }


}


// validate if there is data for a specific date and building ID
function valid_data(data, year, month, day, bID) {
  if(bID in data) {
    if (year in data[bID]) {
      if (month in data[bID][year]) {
        if (day in data[bID][year][month]) {
          if(data[bID][year][month][day][1] == null) return false;
          return true;
        }
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

function check_selection_valid() {
  for(let i = 1; i < 4; i++) {
    if(dataset[i].month != '' && dataset[i].day != '' && dataset[i].building != '') {
      selection_valid[i] = true;
    } else selection_valid[i] = false;
  }
}


function go_previous_day() {
  if(dataset[1].year == 2015 && dataset[1].month <= 1 && dataset[1].day <= 1) return;

  if(dataset[1].month == 1 && dataset[1].day == 1 ) {
    dataset[1].year = Number(dataset[1].year) - 1; 
    dataset[1].month = 12;
    dataset[1].day = 31;
  } else if(dataset[1].day == 1){
    dataset[1].month = Number(dataset[1].month) - 1;
    dataset[1].day = numDays[dataset[1].month];
  } else { 
    dataset[1].day = Number(dataset[1].day) - 1;
  }

  document.getElementById("month1").value = dataset[1].month;
  document.getElementById("year1").value = dataset[1].year;
  document.getElementById("day1").value = dataset[1].day;
  document.getElementById("month2").value = dataset[1].month;
  document.getElementById("year2").value = dataset[1].year;
  document.getElementById("day2").value = dataset[1].day;
  document.getElementById("month3").value = dataset[1].month;
  document.getElementById("year3").value = dataset[1].year;
  document.getElementById("day3").value = dataset[1].day;

  for(let i = 1; i < 4; i++) {
    dataset[i].year = dataset[1].year;
    dataset[i].month = dataset[1].month;
    dataset[i].day = dataset[1].day;
  }

  check_selection_valid();
  for(let i = 1; i < 4; i++) {
    if(selection_valid[i]) get_data_from_json(i);
  }

  update_graph(); 
}

function go_next_day() {
  if(dataset[1].year == 2019 && dataset[1].month == 12 && dataset[1].day >= 31)  return;

  if(dataset[1].month == 12 && dataset[1].day == 31 ) {
    dataset[1].year = Number(dataset[1].year) + 1; 
    dataset[1].month = 1;
    dataset[1].day = 1;
  } else if(dataset[1].day == numDays[dataset[1].month]){
    dataset[1].month = Number(dataset[1].month) + 1;
    dataset[1].day = 1;
  } else { 
    dataset[1].day = Number(dataset[1].day) + 1;
  }

  document.getElementById("month1").value = dataset[1].month;
  document.getElementById("year1").value = dataset[1].year;
  document.getElementById("day1").value = dataset[1].day;
  document.getElementById("month2").value = dataset[1].month;
  document.getElementById("year2").value = dataset[1].year;
  document.getElementById("day2").value = dataset[1].day;
  document.getElementById("month3").value = dataset[1].month;
  document.getElementById("year3").value = dataset[1].year;
  document.getElementById("day3").value = dataset[1].day;

  for(let i = 1; i < 4; i++) {
    dataset[i].year = dataset[1].year;
    dataset[i].month = dataset[1].month;
    dataset[i].day = dataset[1].day;
  }

  check_selection_valid();
  for(let i = 1; i < 4; i++) {
    if(selection_valid[i]) get_data_from_json(i);
  }
  update_graph(); 
}


function go_previous_month() {
  if(dataset[1].year == 2015 && dataset[1].month <= 1) return;

  if(dataset[1].month == 1) {
    dataset[1].year = Number(dataset[1].year) - 1; 
    dataset[1].month = 12;
  } else { 
    dataset[1].month = Number(dataset[1].month) - 1;
  }

  document.getElementById("month1").value = dataset[1].month;
  document.getElementById("year1").value = dataset[1].year;
  document.getElementById("day1").value = dataset[1].day;
  document.getElementById("month2").value = dataset[1].month;
  document.getElementById("year2").value = dataset[1].year;
  document.getElementById("day2").value = dataset[1].day;
  document.getElementById("month3").value = dataset[1].month;
  document.getElementById("year3").value = dataset[1].year;
  document.getElementById("day3").value = dataset[1].day;

  for(let i = 1; i < 4; i++) {
    dataset[i].year = dataset[1].year;
    dataset[i].month = dataset[1].month;
    dataset[i].day = dataset[1].day;
  }

  check_selection_valid();
  for(let i = 1; i < 4; i++) {
    if(selection_valid[i]) get_data_from_json(i);
  }
  update_graph(); 
}

function go_next_month() {
  if(dataset[1].year == 2019 && dataset[1].month == 12)  return;

  if(dataset[1].month == 12) {
    dataset[1].year = Number(dataset[1].year) + 1; 
    dataset[1].month = 1;
  } else {
    dataset[1].month = Number(dataset[1].month) + 1;
  }

  document.getElementById("month1").value = dataset[1].month;
  document.getElementById("year1").value = dataset[1].year;
  document.getElementById("day1").value = dataset[1].day;
  document.getElementById("month2").value = dataset[1].month;
  document.getElementById("year2").value = dataset[1].year;
  document.getElementById("day2").value = dataset[1].day;
  document.getElementById("month3").value = dataset[1].month;
  document.getElementById("year3").value = dataset[1].year;
  document.getElementById("day3").value = dataset[1].day;

  for(let i = 1; i < 4; i++) {
    dataset[i].year = dataset[1].year;
    dataset[i].month = dataset[1].month;
    dataset[i].day = dataset[1].day;
  }

  check_selection_valid();
  for(let i = 1; i < 4; i++) {
    if(selection_valid[i]) get_data_from_json(i);
  }
  update_graph(); 
}
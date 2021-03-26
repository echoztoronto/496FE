var weatherAvg;     
var energyAvg;     
var mychart; 

let chosen_month = 0;
let chosen_year = 2016;

let load_dataset = [];
let temp_dataset = [];
let hum_dataset = [];

let data_is_valid = true;

const attribute_colors = {"load": "rgb(72,72,72)", "temp": "#ffb366", "hum": "#6666ff"};
const month_name = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"};
const default_labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const notif_element = document.getElementById("selection-notif");

// for github page:  url: "/496FE/data/buildingIDs.json" 
// for self testing: url: "../../data/buildingIDs.json",
const fs1 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "/496FE/data/energyAvg.json",
      dataType: "json",
      success: function(data) {
        energyAvg = data;
      }
    });
});

const fs2 = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "/496FE/data/weatherAvg.json",
      dataType: "json",
      success: function(data) {
        weatherAvg = data;
      }
    });
});

update_graph();

//called by choosing a month/year
function set_data (month, year) {
  chosen_month = month.options[month.selectedIndex].value;
  chosen_year = year.options[year.selectedIndex].value;

  get_datasets();
  update_graph(); 
}

function get_datasets() {
  load_dataset = [];
  temp_dataset = [];
  hum_dataset = [];

  if(energyAvg[chosen_year] == undefined) {
    data_is_valid = false;
    return;
  }
  if(energyAvg[chosen_year][chosen_month] == undefined) {
    data_is_valid = false;
    return;
  }

  // for load_dataset 
  for(let i = 1; i < 32; i++) {
    let load_data = energyAvg[chosen_year][chosen_month][i];
    if(load_data != undefined) load_dataset.push(load_data);
  }

  // for temp_dataset 
  for(let i = 1; i < 32; i++) {
    let temp_data = weatherAvg["Temp"][chosen_year][chosen_month][i];
    if(temp_data != undefined) temp_dataset.push(temp_data);
  }

  // for hum_dataset
  for(let i = 1; i < 32; i++) {
    let hum_data = weatherAvg["Humidity"][chosen_year][chosen_month][i];
    if(hum_data != undefined) hum_dataset.push(hum_data);
  }

  data_is_valid = true;
}



function update_graph() {
  if(mychart != undefined) {
    mychart.destroy();
  }
  graph_init();

  if(!data_is_valid) {
    notif_element.style.color = "red";
    notif_element.innerHTML = `We don't have data for ${month_name[chosen_month]} ${chosen_year}`;
    return;
  }

    notif_element.innerHTML = ``;

  let new_temp = { 
    data: temp_dataset,
    label: "Temperature",
    borderColor: attribute_colors['temp'],
    borderWidth: 2,
    type: 'line',
    fill: false,
    yAxisID: 'B',
  };
  mychart.data.datasets.push(new_temp);

  let new_hum = { 
    data: hum_dataset,
    label: "Humidity",
    borderColor: attribute_colors['hum'],
    borderWidth: 2,
    type: 'line',
    fill: false,
    yAxisID: 'C',
  };
  mychart.data.datasets.push(new_hum);

  let new_load = { 
    data: load_dataset,
    label: "Historical Load",
    backgroundColor: attribute_colors['load'],
    fill: false,
    yAxisID: 'A',
  };
  mychart.data.datasets.push(new_load);

  mychart.update();
}

function go_previous() {
  if(chosen_year == 2016 && chosen_month <= 1) {
    notif_element.style.color = "red";
    notif_element.innerHTML = "We don't have data before January 2016!";
    return;
  }

  if(chosen_month == 1) {
    chosen_year = Number(chosen_year) - 1; 
    chosen_month = 12;
    document.getElementById("month").value = chosen_month;
    document.getElementById("year").value = chosen_year;
  } else { 
    chosen_month = Number(chosen_month) - 1;
    document.getElementById("month").value = chosen_month;
  }
  
  get_datasets();
  update_graph(); 
}

function go_next() {
  if(chosen_year == 2019 && chosen_month == 12) {
    notif_element.style.color = "red";
    notif_element.innerHTML = "We don't have data after December 2019!";
    return;
  }

  if(chosen_month == 12) {
    chosen_year = Number(chosen_year) + 1; 
    chosen_month = 1;
    document.getElementById("month").value = chosen_month;
    document.getElementById("year").value = chosen_year;
  } else {
    chosen_month = Number(chosen_month) + 1;
    document.getElementById("month").value = chosen_month;
  }

  get_datasets();
  update_graph(); 
}

function print_all() {
  console.log(load_dataset);
  console.log(temp_dataset);
  console.log(hum_dataset);
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
        text: "Historical Load vs. Temperature vs. Humidity",
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
            labelString: "Date"
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
              labelString: "Historical Load (kW)"
            }
          },
          {
            id: 'B',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Temperature (Degree C)",
            }
          },
          {
            id: 'C',
            type: 'linear',
            position: 'right',
            scaleLabel: {
              fontSize: 20,
              display:true,
              labelString: "Humidity (%)"
            }
          },
        ]
      }  
    }
  });
}
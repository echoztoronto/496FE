
function processData(allText) {
  var record_num = 10; 
  var allTextLines = allText.split(/\r\n|\n/);
  var entries = allTextLines[0].split(',');
  var lines = [];

  while (entries.length>0) {
      data_set = [];
      for (var j=0; j<record_num; j++) {
        data_set.push(parseInt(entries.shift()));
      }
      lines.push(data_set);
  }
  //alert(lines);
  return lines;
}


var fs = $(document).ready(function() {
  $.ajax({
      type: "GET",
      url: "data.txt",
      dataType: "text",
      success: function(data) {
        var data_lines = processData(data);

        var mychart = new Chart(document.getElementById("line-chart"), {
          type: 'line',
          data: {
            labels: [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050],
            datasets: [{ 
                data: data_lines[0],
                label: "Africa",
                borderColor: "#3e95cd",
                fill: false
              }, { 
                data: data_lines[1],
                label: "Asia",
                borderColor: "#8e5ea2",
                fill: false
              }, { 
                data: data_lines[2],
                label: "Europe",
                borderColor: "#3cba9f",
                fill: false
              }, { 
                data: data_lines[3],
                label: "Latin America",
                borderColor: "#e8c3b9",
                fill: false
              }, { 
                data: data_lines[4],
                label: "North America",
                borderColor: "#c45850",
                fill: false
              }
            ]
          },
          options: {
            title: {
              display: true,
              text: 'Some Random Graph',
              fontSize: 20       
            }
          }
        });
      
      mychart.update();
      }
   });
});





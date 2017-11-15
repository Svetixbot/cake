function loadJSON() {   

  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', '../jira.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {

      var xobj2 = new XMLHttpRequest();
      xobj2.overrideMimeType("application/csv");
      xobj2.open('GET', '../planning.csv', true);
      xobj2.onreadystatechange = function () {
        if (xobj2.readyState == 4 && xobj2.status == "200") {
          var papa = require('papaparse')
          var csv = papa.parse(xobj2.responseText);
          var result = reconcile(csv, JSON.parse(xobj.responseText))
          var resultTable = document.getElementById("table");


          var unsorted = new Array();
          for(var projectId in result) {
             unsorted.push(result[projectId])
          }
          var sorted = unsorted.sort(function(line1, line2) {
            if (line1.source == line2.source) {
              if(line1.start > line2.start){
                return -1;
              } else {
                return 1;
              }
            } else {
              if (line1.source == "PlanningIT") {
                return -1;
              } else {
                return 1;
              }
            }
          })

          sorted.map(function(project) {
            writeLine(resultTable, project)
          })


        }
      }

      xobj2.send(null);  
    }
  }
  xobj.send(null);  
}

function reconcile(projects, accounts) {
  var result = {}

  projects.data.map(function(project) {
    result[project[2]] = { id: project[2],
                           name: project[3], 
                           source:"PlanningIT",
                           status: project[19],
                           start: project[25],
                           end: project[26],
                           fy17: project[59],
                           fy18: project[60] }
  })

  accounts.map(function(account) {
    if (result[account.key]) {
      result[account.key].source = "PlanningIT+Jira"
    } else {
      result[account.key] = {id: account.key, name: account.name, source: "Jira"}
    }
  })
  return result
}

function writeLine(table, project) {
  var row = table.insertRow()

  // row.bgColor = (project.source == "PlanningIT") ? "red" :
  //                 (project.source == "PlanningIT+Jira") ? "green" : "white"

  key(row, project.id)
  name(row, project.name)
  aproval(row, project.fy17, project.fy18)
  status(row, project.status)
  start(row, project.start)
  source(row, project.source)

  if(project.source == "PlanningIT") {
    linkToCreateNewAccount(row, project)
  }

}

function linkToCreateNewAccount(row, project) {
  var cell = row.insertCell(6)
  
  cell.innerHTML = "<a href='http://google.com'>jira</a>"
}


function key(row, key) {
  var cell = row.insertCell(0)
  cell.innerHTML = key
}

function aproval(row, fy17, fy18) {
  var cell = row.insertCell(2)
  cell.innerHTML = "FY17:" + fy17 + "|FY18:" + fy18
}

function name(row, name) {
  var cell = row.insertCell(1)
  cell.innerHTML = name
}

function source(row, source) {
  var cell = row.insertCell(5)
  cell.innerHTML = source
}

function status(row, status) {
  var cell = row.insertCell(3)
  cell.innerHTML = status
}

function start(row, start) {
  var cell = row.insertCell(4)
  cell.innerHTML = start
}

loadJSON()
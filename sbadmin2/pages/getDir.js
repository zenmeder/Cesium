function getProject(projectName, callback) {
        $.ajax({
        url: "http://10.171.6.157:8280/CityObjectServer/terriajs/getFileList.php",
        type: "POST",
        data: {projectName: projectName},
        dataType: "json",
        success: function (response) {
            callback(response,projectName)
        },
        error: function (error) {
            console.error(error);
        }
    });
}
function getAllGISProjectMeta() {
    $.ajax({
        url: "http://10.171.6.157:8280/CityObjectServer/query/getUserGISProjects.php",
        type: "POST",
        data: {"owner": "asf@qq.com"},
        dataType: "text",
        success: function(data) {
            var projects = JSON.parse(data);
            for (var i = projects.length - 1; i >= 0; i--) {
                      var projectName = projects[i]['projectName'];                      // to delete
                      if(projectName == 'SPKNGEN' || projectName == 'JX4BKQ'|| projectName == 'LY76IF'){
                            getProject(projectName, function(response,projectName){
                                var inner = '<li><a href="#"><i class="fa fa-wrench fa-fw"></i>'+projectName+'<span class="fa arrow"></span></a></li>';
                                var sideMenu = document.getElementById('projects');
                                sideMenu.innerHTML +=inner;
                                console.log(response);
                                console.log(projectName);
                            });
                      }
                  }      
        }
    });
}

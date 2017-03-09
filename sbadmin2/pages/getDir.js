function getAllGISProjectMeta() {
    $.ajax({
        url: "http://10.171.6.157:8280/CityObjectServer/query/getUserGISProjects.php",
        type: "POST",
        data: {"owner": "asf@qq.com"},
        dataType: "text",
        success: function(data) {
            var projects = JSON.parse(data);
            // console.log(projects);
            for (var i = projects.length - 1; i >= 0; i--) {
                      var projectName = projects[i]['projectName'];
                      var sideMenu = document.getElementById('projects');
                      var inner = '<li><a href="#"><i class="fa fa-wrench fa-fw"></i>'+projectName+'<span class="fa arrow"></span></a></li>';
                      sideMenu.innerHTML +=inner;
                  }      
        }
    });
}
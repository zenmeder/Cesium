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
                      var projectName = projects[i]['projectName']; 
                      var description = projects[i]['description'];                     // to delete
                      if(projectName == 'SPKNGEN' || projectName == 'JX4BKQ'|| projectName == 'LY76IF'){
                            getProject(projectName, function(response,projectName){
                                var inner = $("<li><a href='#' class='active'><i class='fa fa-wrench fa-fw'></i>"+projectName+"<span class='fa arrow'></span></a></li>");
                                var ul = $("<ul class='nav nav-second-level'></ul>").appendTo(inner);
                                response.forEach(function(item){
                                    var name = item.name;
                                    var a = $("<a></a>").html(name).click(function(){
                                    // console.log(response[i]);
                                    getGISFileContent(projectName,name,viewer);
                                  });//.appendTo($("<li></li>").appendTo($(inner)));
                                  var li = $("<li></li>").append(a);
                                  ul.append(li);
                                })
                                var a = $("#projects");
                                a.append($(inner));
                            });
                      }
                  }      
        }
    });
}
function createDataSource(fileName, dataSource) {
    var suffix = fileName.split(".")[1];
    if ("geojson" == suffix)
    {
        return Cesium.GeoJsonDataSource.load(dataSource);
    }
    else
    {
        if ("czml" == suffix)
        {
            return Cesium.CzmlDataSource.load(dataSource);
        }
        else
        {
            if ("kml" == suffix)
            {
                return Cesium.KmlDataSource.load(dataSource);
            }
            else
            {
                return "No support";
            }
        }
    }
}
function getGISFileContent(projectName, fileName, viewer) {
    // var projectName = "SPKNGEN";
    // var fileName = "test.geojson";
    if (fileName.split(".")[1] == "kml" || fileName.split(".")[1] == "kmz")
    {
        if (fileName.split(".")[1] == "kmz")
        {
            bootbox.alert({
                title: "出错了",
                message: "目前还不支持KMZ格式的查看，请期待后续版本。"
            });
            return;
        }
        var options = {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas
        };
        $.ajax({
            url: "http://10.171.6.157:8280/CityObjectServer/terriajs/getPoint.php",
            data: {projectName: projectName, fileName: fileName},
            type: "POST",
            dataType: "json",
            success: function(data){
                if (0 == data.length)
                {
                    bootbox.alert({
                        title: "出错了",
                        message: "没有找到位置信息，请检查文件名是否正确。"
                    });
                    return;
                }
                // console.log(data);
                // viewer.camera.flyHome(0);
                var destination = 0;
                switch (data.length)
                {
                    case 2:
                        destination = new Cesium.Cartesian3.fromDegrees(data[0], data[1]);
                        break;
                    case 3:
                        destination = new Cesium.Cartesian3.fromDegrees(data[0], data[1], data[2]);
                        break;
                    case 4:
                        destination = new Cesium.Cartesian3.fromDegrees(data[0], data[1], data[2], data[3]);
                        break;
                    case 5:
                        destination = new Cesium.Cartesian3.fromDegrees(data[0], data[1], data[2], data[3], data[4]);
                        break;
                }
                viewer.scene.camera.setView({
                    destination: destination
                });
                var dataSource = Cesium.KmlDataSource.load("projects/" + projectName + "/" + fileName, options);
                // viewer.dataSources.removeAll();
                viewer.dataSources.add(dataSource).then(function (dataSource) {
                    // console.log("DataSource:", dataSource);
                    viewer.clock.shouldAnimate = false;
                    var rider = dataSource.entities.getById("tour");
                    viewer.flyTo(rider).then(function () {
                        viewer.trackedEntity = rider;
                        viewer.selectedEntity = viewer.trackedEntity;
                        viewer.clock.multiplier = 30;
                        viewer.clock.shouldAnimate = true;
                    });
                });
                $("li[tag='" + fileName + "'] .eye").toggleClass("eyeclosed").toggleClass("eyeopen");
            }
        });

    }
    else {
        $.ajax({
            url: "http://10.171.6.157:8280/CityObjectServer/terriajs/getFileContent.php",
            data: {projectName: projectName, fileName: fileName},
            type: "POST",
            dataType: "text",
            success: function (response) {
                // console.log("Content: ", response);
                var result = "";
                if (fileName.split(".")[1] == "kml") {
                    result = response;
                }
                else {
                    result = JSON.parse(response);
                }
                var dataSource = createDataSource(fileName, result);
                // if (dataSource.contains("No"))
                {
                    /*bootbox.alert({
                     title: "出错了",
                     message: "不支持的文件类型"
                     });*/
                }
                // else
                {
                    // othis.viewer.dataSources.removeAll();
                    viewer.dataSources.add(dataSource);
                    viewer.zoomTo(dataSource);
                }
            }
        });
    }
}


/*
   根据工程名获取工程里的项目
*/
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
//添加描述的界面
function addDescription(projectName, description){
    $('.panel-default').remove();

    var description_panel=$('<div></div>').addClass('panel panel-default');
    var heading = $('<div></div>').addClass('panel-heading').html(projectName);
    var body = $('<div></div>').addClass('panel-body').append($('<p></p>').html(description).css({'color':'red'}));
    var footer = $('<div></div>').addClass('panel-footer').html('footer');
    description_panel.append(heading).append(body).append(footer);
    $('.nav-side-menu').append(description_panel);
}
// 在菜单中手动添加工程
function addDemo(projectName){
    var li = $('<li></li>').attr({'data-toggle':'collapse','data-target':'#'+projectName}).addClass('collapsed').addClass('projects');
    var a = $('<a></a>').attr('href','#').html('&nbsp;');
    var icon =$('<span></span>').addClass('glyphicon glyphicon-th-list').html('&nbsp;'+projectName);
    a.append(icon);
    a.append($('<span></span>').addClass('arrow'));
    li.append(a);
    var ul = $('<ul></ul>').attr('id',projectName).addClass('sub-menu collapse');
    $('#menu-content').append(ul).append(li);
}
//展示所有工程
function getAllGISProject(){
    $.ajax({
        url: "http://10.171.6.157:8280/CityObjectServer/query/getUserGISProjects.php",
        type: "POST",
        data: {"owner": "asf@qq.com"},
        dataType: "text",
        success: function(data){
            var projects = JSON.parse(data);
            var menu = $('#menu-content');
            for(var i=projects.length-1;i>=0;i--){
                var projectName = projects[i]['projectName'];
                var description = projects[i]['description'];
                if(projectName == 'SPKNGEN' || projectName == 'JX4BKQ'|| projectName == 'LY76IF'){
                    getProject(projectName, function(response,projectName){
                        // var ul = addProject(response, projectName);
                        var li = $('<li></li>').attr({'data-toggle':'collapse','data-target':'#'+projectName}).addClass('collapsed').addClass('projects').click(function(){
                            // addDescription(projectName,description);
                        });
                        var a = $('<a></a>').attr('href','#').html('&nbsp;');
                        var icon =$('<span></span>').addClass('glyphicon glyphicon-th-list').html('&nbsp;'+projectName);
                        a.append(icon);
                        a.append($('<span></span>').addClass('arrow'));
                        li.append(a);
                        var ul = $('<ul></ul>').attr('id',projectName).addClass('sub-menu collapse');
                            
                        response.forEach(function(item){
                            var name = item.name;
                            ul.append($('<li></li>').html(name).click(function(){
                                getGISFileContent(projectName,name,viewer);
                                $('.active').removeClass('active');
                                $(this).addClass('active');
                            }));
                        });
                        menu.append(li).append(ul);
                    });
                }
            }
            //to delete 临时数据
            addDemo('临港概貌');
            addDemo('人口数据');
            addDemo('车流数据');
            addDemo('视频数据');
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
/*
    加载图层
*/
function getGISFileContent(projectName, fileName, viewer) {
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
                viewer.dataSources.add(dataSource).then(function (dataSource) {
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
                viewer.dataSources.add(dataSource);
                viewer.zoomTo(dataSource);
            }
        });
    }
}


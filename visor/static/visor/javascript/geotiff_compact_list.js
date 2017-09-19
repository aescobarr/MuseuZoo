$(document).ready(function() {

    var handleJson=function(data) {
        for (var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];
        console.log(feature)
            L.popup()
            .setLatLng(e.latlng)
            .setContent(L.Util.template("<h2>{appcode}</h2><p>{url}</p>", feature.properties))
            .openOn(map);
        }
    }

    /*
    var identify = function (e){
	    var BBOX = map.getBounds().toBBoxString();
        var WIDTH = map.getSize().x;
        var HEIGHT = map.getSize().y;
        var X = Math.round(map.layerPointToContainerPoint(e.layerPoint).x);
        var Y = Math.round(map.layerPointToContainerPoint(e.layerPoint).y);
        var url = 'http://127.0.0.1:8080/geoserver/wms/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&layers=geomuseu:rcp26b709_4326&BBOX='+BBOX+'&FEATURE_COUNT=5&info_format=application/json&HEIGHT='+HEIGHT+'&WIDTH='+WIDTH+'&query_layers=geomuseu:rcp26b709_4326&SRS=EPSG:4326&buffer=15&X='+X+'&Y='+Y;

        $.ajax({
            url:url,
            datatype: "json",
            type: "GET",
            success:handleJson
        });
    }

	map.on('click',identify);
	*/

    var table = $('#geotiff_list').DataTable( {
        "ajax": {
            "url": _geotiff_list_url,
            "dataType": 'json',
            "contentType": "application/json; charset=utf-8",
            "dataSrc": function (json) {
                return json;
            }
        },
        "pageLength": 25,
        "bLengthChange": false,
        "stateSave": true,
        //"responsive": true,
        "columns": [
            { "data": "name" }
            ,{ "data": "tags" }
            ,{ "data": "button_add_raster" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Name"
            },
            {
                "targets":1,
                "title": "Tags",
                "render": function(value){
                    var retVal = "";
                    if(value){
                        var tags = value.split(',');
                        for(var i = 0; i < tags.length; i++){
                            retVal += '<span class="label label-warning">' + tags[i] + '</span><br>';
                        }
                    }
                    return retVal;
                }
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button class=\"button_add_raster btn btn-success\">Afegir a seleccionats</button>",
                "sortable": false
            },

        ],
        "select": {
            "style":    'os',
            "selector": 'td:first-child'
        }
    } );


} );
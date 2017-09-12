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
            ,{ "data": "srs_code" }
            ,{ "data": "tags" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Name"
            },
            {
                "targets":1,
                "title": "SRS"
            },
            {
                "targets":2,
                "title": "Tags"
            },

        ],
        "select": {
            "style":    'os',
            "selector": 'td:first-child'
        }
    } );

    table.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
            //var data = table.rows( indexes ).data().pluck( 'id' );
            var data = table.rows( indexes ).data();
            //alert(data[0]);
            if(data && data[0]){
                var pre_layer = data[0].full_geoserver_layer_name;
                var wmsLayer = L.tileLayer.wms(
                    wms_url,
                    {
                        layers: pre_layer,
                        transparent: true
                    }
                );
                wmsLayer.addTo(map);
                wmsLayer.setOpacity(0.4);
                }
            }
    } );

    table.on( 'deselect', function ( e, dt, type, indexes ) {
        map.eachLayer(
            function(layer){
                if(layer != osm){
                    map.removeLayer(layer);
                }
            }
        );
    });

} );
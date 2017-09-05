$(document).ready(function() {
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
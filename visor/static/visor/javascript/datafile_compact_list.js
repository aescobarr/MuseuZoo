$(document).ready(function() {
    var geoJsonLayer;
    var table = $('#datafile_list').DataTable( {
        "ajax": {
            "url": _datafile_list_url,
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
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Name"
            },
            {
                "targets":1,
                "title": "Tags"
            }
        ],
        "select": {
            "style":    'single',
            "selector": 'td:first-child'
        }
    } );

    table.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
            var data = table.rows( indexes ).data();
            json = JSON.parse(data[0].geometry_geojson);
            geoJsonLayer = L.geoJson().addTo(map);
            geoJsonLayer.addData(json);
        }
    } );

    table.on( 'deselect', function ( e, dt, type, indexes ) {
        map.eachLayer(
            function(layer){
                if(layer != osm && layer == geoJsonLayer){
                    map.removeLayer(layer);
                }
            }
        );
    });

} );
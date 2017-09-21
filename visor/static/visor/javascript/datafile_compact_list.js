$(document).ready(function() {
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
            ,{ "data": "button_add_datafile" }
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
                "defaultContent": "<button class=\"button_add_datafile btn btn-success\"><span class=\"fa fa-plus\"></span></button>",
                "sortable": false
            },
        ],
        "select": {
            "style":    'single',
            "selector": 'td:first-child'
        }
    } );

    /*table.on( 'select', function ( e, dt, type, indexes ) {
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
    });*/

} );
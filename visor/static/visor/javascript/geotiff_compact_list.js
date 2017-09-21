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
                //"defaultContent": "<button class=\"button_add_raster btn btn-success\">Afegir a seleccionats</button>",
                "defaultContent": "<button class=\"button_add_raster btn btn-success\"><span class=\"fa fa-plus\"></span></button>",
                "sortable": false
            },

        ],
        "select": {
            "style":    'os',
            "selector": 'td:first-child'
        }
    } );


} );
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
    };

    var table = $('#geotiff_list').DataTable( {
        "ajax": {
            "url": _datatable_geotiff_list_url,
            "dataType": 'json'
        },
        "serverSide": true,
        "processing": true,
        "language": opcions_llenguatge_catala,
        "pageLength": 25,
        "pagingType": "full_numbers",
        "bLengthChange": false,
        stateSave: true,
        stateSaveCallback: function(settings,data) {
            localStorage.setItem( 'DataTables_' + settings.sInstance, JSON.stringify(data) )
        },
        stateLoadCallback: function(settings) {
            return JSON.parse( localStorage.getItem( 'DataTables_' + settings.sInstance ) )
        },
        "columns": [
            { "data": "name" }
            ,{ "data": "tags" }
            ,{ "data": "button_add_raster" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Nom"
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

        ]
    } );

    /*
    var table = $('#geotiff_list').DataTable( {
        "ajax": {
            "url": _geotiff_list_url,
            "dataType": 'json',
            "contentType": "application/json; charset=utf-8",
            "dataSrc": function (json) {
                return json;
            }
        },
        "language": opcions_llenguatge_catala,
        "pageLength": 25,
        "bLengthChange": false,
        "stateSave": true,
        "columns": [
            { "data": "name" }
            ,{ "data": "tags" }
            ,{ "data": "button_add_raster" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Nom"
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

        ]
    } );
    */

} );
$(document).ready(function() {
    var table = $('#datafile_list').DataTable( {
        "ajax": {
            "url": _datatable_datafile_list_url,
            "dataType": 'json',
        },
        "serverSide": true,
        "processing": true,
        "language": opcions_llenguatge_catala,
        "pageLength": 25,
        "pagingType": "full_numbers",
        "bLengthChange": false,
        "columns": [
            { "data": "name" }
            ,{ "data": "tags" }
            ,{ "data": "button_add_datafile" }
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
                "defaultContent": "<button class=\"button_add_datafile btn btn-success\"><span class=\"fa fa-plus\"></span></button>",
                "sortable": false
            },
        ]
    } );
    /*var table = $('#datafile_list').DataTable( {
        "ajax": {
            "url": _datafile_list_url,
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
        //"responsive": true,
        "columns": [
            { "data": "name" }
            ,{ "data": "tags" }
            ,{ "data": "button_add_datafile" }
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
                "defaultContent": "<button class=\"button_add_datafile btn btn-success\"><span class=\"fa fa-plus\"></span></button>",
                "sortable": false
            },
        ]
    } );*/


} );
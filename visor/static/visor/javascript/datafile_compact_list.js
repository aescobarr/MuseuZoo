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
} );
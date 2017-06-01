$(document).ready(function() {
    $('#example').DataTable( {
        "ajax": {
            "url": wmslayer_list_url,
            "dataType": 'json',
            "contentType": "application/json; charset=utf-8",
            "dataSrc": function (json) {
                return json;
            }
        },
        "columns": [
            //{ "data": "id" },
            { "data": "label" }
            ,{ "data": "base_url" }
            ,{ "data": "name" }
            ,{ "data": "button_edit" }
            ,{ "data": "button_delete" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Label"
            },
            {
                "targets":1,
                "title": "Base URL"
            },
            {
                "targets":2,
                "title": "Name"
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button>Delete</button>",
                "sortable": false
            },
            {
                "targets": -2,
                "data": null,
                "defaultContent": "<button>Edit</button>",
                "sortable": false
            }
        ]
    } );
} );
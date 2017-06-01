$(document).ready(function() {
    var confirmDialog = function(message,id){
        $('<div></div>').appendTo('body')
            .html('<div><h6>'+message+'</h6></div>')
            .dialog({
                modal: true, title: 'Delete message', zIndex: 10000, autoOpen: true,
                width: 'auto', resizable: false,
                buttons: {
                    Yes: function () {
                        delete_geotiff(id);
                        $(this).dialog("close");
                        //table.ajax.reload();
                        //$('#geotiff_list').DataTable().ajax.reload();
                    },
                    No: function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(this).remove();
                }
        });
    };

    var delete_geotiff = function(id){
        $.ajax({
            url: _geotiff_delete_url + id,
            method: "DELETE",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                 alert("Deleted!");
                 table.ajax.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Error deleting");
            }
        });
    };
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
            ,{ "data": "file" }
            ,{ "data": "uploaded_by" }
            ,{ "data": "date_uploaded" }
            ,{ "data": "date_modified" }
            ,{ "data": "tags" }
            ,{ "data": "button_delete" }
            ,{ "data": "button_edit" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Name"
            },
            {
                "targets":1,
                "title": "File",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        data = '<a href="' + data + '">' + data + '</a>';
                    }
                    return data;
                }
            },
            {
                "targets":2,
                "title": "Uploaded by"
            },
            {
                "targets":3,
                "title": "Date Uploaded",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":4,
                "title": "Date Modified",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":5,
                "title": "Tags"
            },
            {
                "targets": -2,
                "data": null,
                "defaultContent": "<button class=\"delete_button btn btn-danger\">Delete</button>",
                "sortable": false
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button class=\"edit_button btn btn-info\">Edit</button>",
                "sortable": false
            },
        ]
    } );
    $('#geotiff_list tbody').on('click', 'td button.delete_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        //alert(id);
        confirmDialog("Segur que vols esborrar?",id);
    });
    $('#geotiff_list tbody').on('click', 'td button.edit_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        window.location.href = _geotiff_update_url + id;
    });

} );
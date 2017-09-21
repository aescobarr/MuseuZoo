$(document).ready(function() {
    var confirmDialog = function(message,id){
        $('<div></div>').appendTo('body')
            .html('<div><h6>'+message+'</h6></div>')
            .dialog({
                modal: true, title: 'Delete message', zIndex: 10000, autoOpen: true,
                width: 'auto', resizable: false,
                buttons: {
                    Yes: function () {
                        delete_operation(id);
                        $(this).dialog("close");
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
    var delete_operation = function(id){
        $.ajax({
            url: _rasterlist_delete_url + id,
            method: "DELETE",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                 toastr.success("Esborrat amb èxit!");
                 table.ajax.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                toastr.error("Error esborrant");
            }
        });
    };
    var table = $('#rasterlist_list').DataTable( {
        "ajax": {
            "url": _rasterlist_list_url,
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
            ,{ "data": "owner" }
            ,{ "data": "rasters" }
            ,{ "data": "button_delete" }
            ,{ "data": "button_edit" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Nom"
            },
            {
                "targets":1,
                "title": "Propietari"
            },
            {
                "targets":2,
                "title": "Rasters",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        var output = new Array();
                        output.push('<ul>');
                        for(var i = 0; i < data.length; i++){
                            bit = data[i];
                            output.push('<li><a href="' + bit.file + '">' + bit.name + '</a></li>');
                        }
                        output.push('</ul>');
                        data = output.join('');
                    }
                    return data;
                }
            },
            {
                "targets": -2,
                "data": null,
                "defaultContent": "<button class=\"delete_button btn btn-danger\">Esborrar</button>",
                "sortable": false
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button class=\"edit_button btn btn-info\">Editar</button>",
                "sortable": false
            },
        ]
    } );
    $('#rasterlist_list tbody').on('click', 'td button.delete_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        confirmDialog("Segur que vols esborrar?",id);
    });
    $('#rasterlist_list tbody').on('click', 'td button.edit_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        url = "/rasterlist/update/" + id
        window.location.href = url;
        //confirmDialog("Segur que vols esborrar?",id);
    });
} );

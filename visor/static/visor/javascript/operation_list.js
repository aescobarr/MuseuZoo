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
            url: _operation_delete_url + id,
            method: "DELETE",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                 alert("Esborrat amb èxit!");
                 table.ajax.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Error esborrant");
            }
        });
    };
    var table = $('#operation_list').DataTable( {
        "ajax": {
            "url": _operation_list_url,
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
            { "data": "raster_operator" }
            ,{ "data": "file_operator" }
            ,{ "data": "performed_on" }
            ,{ "data": "performed_by" }
            ,{ "data": "result_path" }
            ,{ "data": "button_delete" }
        ],
        "columnDefs": [
            {
                "targets":0,
                "title": "Raster",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        var output = new Array();
                        output.push('<ul>');
                        for(var i = 0; i < data.length; i++){
                            bit = data[0];
                            output.push('<li><a href="' + bit.file + '">' + bit.name + '</a></li>');
                        }
                        output.push('</ul>');
                        data = output.join('');
                    }
                    return data;
                }
            },
            {
                "targets":1,
                "title": "Fitxer",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        data = '<a href="' + data.file + '">' + data.name + '</a>';
                    }
                    return data;
                }
            },
            {
                "targets":2,
                "title": "Executat a"
            },
            {
                "targets":3,
                "title": "Usuari"
            },
            {
                "targets":4,
                "title": "Fitxer de resultats",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        data = '<a href="/media/' + data + '">' + data + '</a>';
                    }
                    return data;
                }
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button class=\"delete_button btn btn-danger\">Esborrar</button>",
                "sortable": false
            }
        ]
    } );
    $('#operation_list tbody').on('click', 'td button.delete_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        //alert(id);
        confirmDialog("Segur que vols esborrar?",id);
    });

} );
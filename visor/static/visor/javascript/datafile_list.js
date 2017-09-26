$(document).ready(function() {
    var confirmDialog = function(message,id){
        $('<div></div>').appendTo('body')
            .html('<div><h6>'+message+'</h6></div>')
            .dialog({
                modal: true, title: 'Esborrant fitxer de dades...', zIndex: 10000, autoOpen: true,
                width: 'auto', resizable: false,
                buttons: {
                    Yes: function () {
                        delete_datafile(id);
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
    var delete_datafile = function(id){
        $.ajax({
            url: _datafile_delete_url + id,
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

    var table = $('#datafile_list').DataTable( {
        "ajax": {
            "url": _datatable_datafile_list_url,
            "dataType": 'json'
        },
        "serverSide": true,
        "processing": true,
        "language": opcions_llenguatge_catala,
        "pageLength": 25,
        "pagingType": "full_numbers",
        "bLengthChange": false,
        "columns": [
            { "data": "name" }
            ,{ "data": "file" }
            ,{ "data": "uploaded_by" }
            ,{ "data": "date_uploaded" }
            ,{ "data": "date_modified" }
            ,{ "data": "file_type" }
            ,{ "data": "tags" }
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
                "title": "Fitxer",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        data = '<a href="' + data + '">' + data + '</a>';
                    }
                    return data;
                }
            },
            {
                "targets":2,
                "title": "Carregat per"
            },
            {
                "targets":3,
                "title": "Data de càrrega",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":4,
                "title": "Data darrera modificació",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":5,
                "title": "Tipus de fitxer"
            },
            {
                "targets":6,
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

    /*
    var table = $('#datafile_list').DataTable( {
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
            ,{ "data": "file" }
            ,{ "data": "uploaded_by" }
            ,{ "data": "date_uploaded" }
            ,{ "data": "date_modified" }
            ,{ "data": "file_type" }
            ,{ "data": "tags" }
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
                "title": "Fitxer",
                "render": function(data, type, row, meta){
                    if(type === 'display'){
                        data = '<a href="' + data + '">' + data + '</a>';
                    }
                    return data;
                }
            },
            {
                "targets":2,
                "title": "Carregat per"
            },
            {
                "targets":3,
                "title": "Data de càrrega",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":4,
                "title": "Data darrera modificació",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":5,
                "title": "Tipus de fitxer"
            },
            {
                "targets":6,
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
    } );*/

    $('#datafile_list tbody').on('click', 'td button.delete_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        //alert(id);
        confirmDialog("Segur que vols esborrar?",id);
    });

    $('#datafile_list tbody').on('click', 'td button.edit_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        window.location.href = _datafile_update_url + id;
    });

} );
$(document).ready(function() {
    var confirmDialog = function(message,id){
        $('<div></div>').appendTo('body')
            .html('<div><h6>'+message+'</h6></div>')
            .dialog({
                modal: true, title: 'Esborrant raster...', zIndex: 10000, autoOpen: true,
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
                 //alert("Esborrat amb èxit!");
                 toastr.success("Esborrat amb èxit!");
                 table.ajax.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                //alert("Error esborrant");
                toastr.error("Error esborrant");
            }
        });
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
        "stateSave":true,
        stateSave: true,
        stateSaveCallback: function(settings,data) {
            localStorage.setItem( 'DataTables_' + settings.sInstance, JSON.stringify(data) )
        },
        stateLoadCallback: function(settings) {
            return JSON.parse( localStorage.getItem( 'DataTables_' + settings.sInstance ) )
        },
        "columns": [
            { "data": "name" }
            ,{ "data": "file" }
            ,{ "data": "srs_code" }
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
                "title": "Sistema referència"
            },
            {
                "targets":3,
                "title": "Propietari"
            },
            {
                "targets":4,
                "title": "Data de càrrega",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":5,
                "title": "Data darrera modificació",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
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
        //"responsive": true,
        "columns": [
            { "data": "name" }
            ,{ "data": "file" }
            ,{ "data": "srs_code" }
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
                "title": "Sistema referència"
            },
            {
                "targets":3,
                "title": "Propietari"
            },
            {
                "targets":4,
                "title": "Data de càrrega",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
            },
            {
                "targets":5,
                "title": "Data darrera modificació",
                "type": "date",
                "render": function(value){
                    var date = new Date(value);
                    var month = date.getMonth() + 1;
                    return date.getDate() + "/" + (month.length > 1 ? month : "0" + month) + "/" + date.getFullYear() + " - " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                }
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
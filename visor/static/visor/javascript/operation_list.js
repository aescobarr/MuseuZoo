$(document).ready(function() {
    var confirmDialog = function(message,id){
        $('<div></div>').appendTo('body')
            .html('<div><h6>'+message+'</h6></div>')
            .dialog({
                modal: true, title: 'Esborrant operacio...', zIndex: 10000, autoOpen: true,
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
                 toastr.success("Esborrat amb èxit!");
                 table.ajax.reload();
            },
            error: function(jqXHR, textStatus, errorThrown){
                toastr.error("Error esborrant");
            }
        });
    };

    var table = $('#operation_list').DataTable( {
        "ajax": {
            "url": _operation_datatable_list_url,
            "dataType": 'json'
        },
        "serverSide": true,
        "processing": true,
        "language": opcions_llenguatge_catala,
        "pageLength": 5,
        "pagingType": "full_numbers",
        "bLengthChange": false,
        "columns": [
            { "data": "raster_operator" }
            ,{ "data": "file_operator" }
            ,{ "data": "performed_on" }
            ,{ "data": "performed_by" }
            ,{ "data": "result_path" }
            ,{ "data": "status" }
            ,{ "data": "button_delete" }
            ,{ "data": "button_detall" }
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
                "targets":5,
                "title": "Status",
                "render": function(data, type, row, meta){
                    if(data=='SUCCESS'){
                        data = '<i class="fa fa-check" style="color:#01DF01;" aria-hidden="true"></i>';
                    }else if(data=='FAILURE'){
                        data = '<i class="fa fa-times" style="color:#FF0000;" aria-hidden="true"></i>';
                    }else{
                        data = '<i id="status-spinner" class="fa fa-spinner fa-spin" aria-hidden="true" style="display: none;"></i>';
                    }
                    return data;
                },
                "sortable": false
            },
            {
                "targets": -1,
                "data": null,
                "defaultContent": "<button class=\"delete_button btn btn-danger\">Esborrar</button>",
                "sortable": false
            },
            {
                "targets": -2,
                "data": null,
                "defaultContent": "<button class=\"edit_button btn btn-info\">Detall operació</button>",
                "sortable": false
            }
        ]
    } );

    $('#operation_list tbody').on('click', 'td button.delete_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        confirmDialog("Segur que vols esborrar?",id);
    });

    $('#operation_list tbody').on('click', 'td button.edit_button', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var id = row.data().id
        url = "/operation/" + id
        window.open(url,'_blank');
    });

    var dtable = $("#operation_list").dataTable().api();

    $(".dataTables_filter input")
    .unbind() // Unbind previous default bindings
    .bind("input", function(e) { // Bind our desired behavior
        // If the length is 3 or more characters, or the user pressed ENTER, search
        if(this.value.length >= 3 || e.keyCode == 13) {
            // Call the API search function
            dtable.search(this.value).draw();
        }
        // Ensure we clear the search if they backspace far enough
        if(this.value == "") {
            dtable.search("").draw();
        }
        return;
    });

} );
$(document).ready(function() {

    var table;

    var have_it_icon = function(data,type,row){
        if(type=='display'){
            if(data==true){
                return '<i class="fa fa-check" aria-hidden="true"></i>';
            }else{
                return '<i class="fa fa-ban" aria-hidden="true"></i>';
            }
        }
        return data;
    };

    var createDataTable = function(url){
        /*$("#available_layers_container").hide();
        $("#available_layers").empty();*/
        if(table){
            table.destroy();
        }
        table = $('#layerlist').DataTable( {
            "ajax": {
                "url": layerload_url,
                "data": {
                    "url" : url
                },
                "dataType": 'json',
                "contentType": "application/json; charset=utf-8",
                "dataSrc": function (json) {
                    return json;
                }
            },
            dom: 'Bfrtip',
            buttons: [
                {
                    text: 'Select all layers',
                    action: function ( e, dt, node, config ) {
                        $('.lyrcheck').prop('checked', true);
                    }
                },
                {
                    text: 'Deselect all layers',
                    action: function ( e, dt, node, config ) {
                        $('.lyrcheck').prop('checked', false);
                    }
                }
            ],
            "paging": false,
            "columns": [
                //{ "data": "id" },
                { "data": "label" }
                ,{ "data": "base_url" }
                ,{ "data": "name" }
                ,{ "data": "have_it", "render":have_it_icon }
                ,{ "data": "button_check" }
                /*,{ "data": "button_delete" }*/
            ],
            "columnDefs": [
                {
                    "targets":0,
                    "title": "Label"
                },
                {
                    "targets":1,
                    "title": "Base URL",
                    "sortable": false
                },
                {
                    "targets":2,
                    "title": "Name"
                }
                ,
                {
                    "targets":3,
                    "title": "Already present in catalog?"
                }
                ,
                {
                    "targets": -1,
                    "data": null,
                    "defaultContent": '<input class="lyrcheck" type=checkbox>',
                    "sortable": false,
                    "title": "Add to local catalog?"
                }
            ]
        } );

    };

    var buildList = function(data){
        for(var i=0; i < data.length; i++){
            var this_data = data[i];
            $("#available_layers").append('<li>' + this_data.label + ' - ' + this_data.name + '<input id="' + this_data.name + '" type="checkbox"></li>');
        }
        $("#available_layers_container").show();
    };

    $( "#load_wms_list" ).click(function() {
        var url = $('#wms_server_url').val();
        /*ajaxlayerload(encodeURI(url));*/
        createDataTable(encodeURI(url));
    });

});
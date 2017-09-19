$(document).ready(function() {

    var raster_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-raster-id-value">###id</span><a class="tagit-close close-raster"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';
    var datafile_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-datafile-id-value">###id</span><a class="tagit-close close-datafile"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';

    var creua = function(){
        var count_rasters = get_selected_raster_count();
        var count_files = get_selected_datafile_count();

        if ( count_rasters < 1 || count_files < 1){
            alert("Cal triar com a mínim un ràster i un fitxer de dades");
        }else{
            var operation = instantiate_op();
            create_op(operation);
        }
    };

    var get_raster_ids = function(){
        var retVal = new Array();
        $('.hidden-raster-id-value').each(function(index,value){
            retVal.push(parseInt($(this).text()));
        });
        return retVal;
    };

    var get_datafile_ids = function(){
        return parseInt($('.hidden-datafile-id-value').text());
    };

    var get_selected_raster_count = function(){
        var retVal = 0;
        $('.hidden-raster-id-value').each(function(index,value){
            retVal++;
        });
        return retVal;
    }

    var get_selected_datafile_count = function(){
        if ($('.hidden-datafile-id-value').text() == '') {
            return 0;
        }
        return 1;
    }

    var instantiate_op = function(){
        var raster_ids = get_raster_ids();
        var datafile_id = get_datafile_ids();
        var op = {
            raster_operator: raster_ids,
            file_operator: datafile_id,
            performed_by: _user_id
        };
        return JSON.stringify(op);
    };

    var create_op = function(operation){
        $("#link_op").html('');
        $.ajax({
            url: _operation_create_url,
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: operation,
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                 $("#link_op").html('<a href="/operation/' + data.id + '">Enllaç al resultat</a>');
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert("Error " + textStatus);
            }
        });
    };

    $( "#creua" ).click(function() {
        creua();
    });


    $(document).on('click','a.close-raster',function(){
        var a = $(this);
        var li = a.parent();
        var ul = li.parent();
        li.remove();
        var raster_id = $(this).parent().find('.hidden-raster-id-value').text();
        //map.removeLayer(wmsLayers[raster_id]);
        control_layers.removeLayer(wmsLayers[raster_id]);
        map.removeLayer(wmsLayers[raster_id]);
    });

    $(document).on('click','a.close-datafile',function(){
        var a = $(this);
        var li = a.parent();
        var ul = li.parent();
        li.remove();
        if(geoJsonLayer){
            map.removeLayer(geoJsonLayer);
        }
    });


    $('#geotiff_list tbody').on('click', 'td button.button_add_raster', function () {
        var tr = $(this).closest('tr');
        var row = $('#geotiff_list').DataTable().row( tr );
        var id = row.data().id;
        var label = row.data().name;
        var arr = [];
        var layer = row.data().full_geoserver_layer_name;
        $('.hidden-raster-id-value').each(function(index,value){
            arr.push(parseInt($(this).text()));
        });
        if (_.contains(arr,id)){
            alert("Aquest raster ja està a la llista de seleccionats!");
        }else{
            var new_template = raster_li_element_template.replace('###label',label);
            new_template = new_template.replace('###id',id);
            $('.selected-rasters').append(new_template);
            var wmsLayer;
            if (wmsLayers[id.toString()]){
                wmsLayer = wmsLayers[id.toString()];
            }else{
                wmsLayer = L.tileLayer.wms(wms_url,{layers: layer,transparent: true});
                wmsLayers[id.toString()] = wmsLayer;
            }
            wmsLayer.setOpacity(0.4);
            control_layers.addOverlay(wmsLayer,label);
            wmsLayer.addTo(map);
        }
    });

    $('#datafile_list tbody').on('click', 'td button.button_add_datafile', function () {
        var tr = $(this).closest('tr');
        var row = $('#datafile_list').DataTable().row( tr );
        var id = row.data().id;
        var label = row.data().name;
        var geom = row.data().geometry_geojson;
        var json = JSON.parse(geom);
        var arr = [];
        $('.hidden-datafile-id-value').each(function(index,value){
            arr.push(parseInt($(this).text()));
        });
        if (_.contains(arr,id)){
            alert("Aquest fitxer de dades ja està a la llista de seleccionats!");
        }else{
            var new_template = datafile_li_element_template.replace('###label',label);
            new_template = new_template.replace('###id',id);
            $('.selected-datafiles').empty();
            $('.selected-datafiles').append(new_template);
            if(geoJsonLayer){
                map.removeLayer(geoJsonLayer);
            }
            geoJsonLayer = L.geoJson().addTo(map);
            geoJsonLayer.addData(json);
        }
    });

} );
$(document).ready(function() {

    var raster_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-raster-id-value">###id</span><a class="tagit-close close-raster"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';
    var datafile_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-datafile-id-value">###id</span><a class="tagit-close close-datafile"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';

    var creua = function(){
        var count_rasters = get_selected_raster_count();
        var count_files = get_selected_datafile_count();

        if ( count_rasters < 1 || count_files < 1){
            //alert("Cal triar com a mínim un ràster i un fitxer de dades");
            toastr.warning('Cal triar com a mínim un ràster i un fitxer de dades');
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
                toastr.error("Error " + textStatus);
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
        if(get_selected_raster_count()==0){
            $('.selected-rasters').parent().css('visibility','hidden');
        }
    });

    $(document).on('click','a.close-datafile',function(){
        var a = $(this);
        var li = a.parent();
        var ul = li.parent();
        li.remove();
        if(geoJsonLayer){
            map.removeLayer(geoJsonLayer);
        }
        if(get_selected_datafile_count()==0){
            $('#selected-rasters-control').css('visibility','hidden');
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
            $('.selected-rasters').parent().css('visibility','visible');
            var new_template = raster_li_element_template.replace('###label',label);
            new_template = new_template.replace('###id',id);
            $('.selected-rasters').append(new_template);
            var wmsLayer;
            if (wmsLayers[id.toString()]){
                wmsLayer = wmsLayers[id.toString()];
            }else{
                wmsLayer = L.tileLayer.wms(wms_url,{layers: layer,transparent: true});
                //wmsLayer = L.tileLayer.betterWms(wms_url,{layers: layer,transparent: true});
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
            $('.selected-datafiles').parent().css('visibility','visible');
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

    var showGetFeatureInfo = function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error
        // Otherwise show the content in a popup, or something.
        L.popup({ maxWidth: 800}).setLatLng(latlng).setContent(content).openOn(map);
  }

    var getFeatureInfo = function(evt,querylayers){
        // Make an AJAX request to the server and hope for the best
        var url = getFeatureInfoUrl(evt.latlng,querylayers);
        $.ajax({
          url: url,
          success: function (data, status, xhr) {
            var err = typeof data === 'string' ? null : data;
            showGetFeatureInfo(err, evt.latlng, data);
          },
          error: function (xhr, status, error) {
            showGetFeatureInfo(error);
          }
        });
    }

    var getFeatureInfoUrl = function(latlng,querylayers){
        var point = map.latLngToContainerPoint(latlng, map.getZoom());
        var size = map.getSize();

        var params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: '',
          transparent: true,
          version: '1.1.1',
          format: 'image/jpeg',
          bbox: map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: querylayers,
          query_layers: querylayers,
          info_format: 'text/html',
          feature_count: 10
        };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return wms_url + L.Util.getParamString(params, wms_url, true);
    };

    map.on('click', function(evt){
        var layers_in_control = get_raster_ids();
        if(layers_in_control.length > 0){
            var param_layers = [];
            for(var i=0; i < layers_in_control.length; i++){
                param_layers.push( wmsLayers[layers_in_control[i]].wmsParams.layers );
            };
            var querylayers = param_layers.join(',');
            getFeatureInfo(evt,querylayers);
        }
    });

    var instantiate_list = function(){
        var raster_ids = get_raster_ids();
        var name = $('#name').val();
        var list = {
            rasters: raster_ids,
            name: name,
            owner: _user_id
        };
        return JSON.stringify(list);
    };

    var addList = function(){
        var list = instantiate_list();
        $.ajax({
            url: _list_create_url,
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: list,
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                dialog.dialog( "close" );
                toastr.success("Llista de favorits desada amb èxit!");
            },
            error: function(jqXHR, textStatus, errorThrown){
                toastr.error("Error " + jqXHR.responseText);
            }
        });
    };

    dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 200,
      width: 400,
      modal: true,
      buttons: {
        "Desa la llista": addList,
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
      }
    });

    form = dialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        addList();
    });

    $( "#desa-llista" ).button().on( "click", function() {
        dialog.dialog( "open" );
    });

    var put_favorites_on_map = function(raster_list){
        for(var i = 0; i < raster_list.length; i++){
            put_raster_on_map_and_selected_list(raster_list[i].id,raster_list[i].name,raster_list[i].full_geoserver_layer_name);
        }
    };

    var put_raster_on_map_and_selected_list = function(raster_id,label,layer){
        $('#selected-rasters-control').css('visibility','visible');
        var new_template = raster_li_element_template.replace('###label',label);
        new_template = new_template.replace('###id',raster_id);
        $('.selected-rasters').append(new_template);
        var wmsLayer;
        if (wmsLayers[raster_id.toString()]){
            wmsLayer = wmsLayers[raster_id.toString()];
        }else{
            wmsLayer = L.tileLayer.wms(wms_url,{layers: layer,transparent: true});
            //wmsLayer = L.tileLayer.betterWms(wms_url,{layers: layer,transparent: true});
            wmsLayers[raster_id.toString()] = wmsLayer;
        }
        wmsLayer.setOpacity(0.4);
        control_layers.addOverlay(wmsLayer,label);
        wmsLayer.addTo(map);
    }

    $( "#autoc_favorits" ).autocomplete({
        source: _list_list_url,
        minLength: 2,
        select: function( event, ui ) {
            //log( "Selected: " + ui.item.value + " aka " + ui.item.id );
            var listname = ui.item.name;
            var list_id = ui.item.id;
            //toastr.info(ui.item);
            $('#autoc_favorits').val(listname);
            put_favorites_on_map(ui.item.rasters);
            return false;
        }
    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
        return $( "<li>" )
            .append( "<div>" + item.name + "</div>" )
            .appendTo( ul );
    };


} );
$(document).ready(function() {

    var raster_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-raster-id-value">###id</span><a class="tagit-close close-raster"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';
    var hidden_input_template = '<input id="id_rasters_###id" name="rasters" type="hidden" value="###value" />';

    $( "#rasters_autocomplete" ).autocomplete({
        source: '/api/geotiffs/',
        minLength: 2,
        select: function( event, ui ) {
            var label = ui.item.name;
            var id = ui.item.id;
            if (raster_already_in_list(id)){
                toastr.warning("Aquest ràster ja és a la llista.");
                return false;
            }
            add_raster_to_autocomplete(id,label);
            clear_inputs();
            update_selected_rasters();
            $('#rasters_autocomplete').val('');
            return false;
        }
    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
        return $( "<li>" )
            .append( "<div>" + item.name + "</div>" )
            .appendTo( ul );
    };

    var add_raster_to_autocomplete = function(id,label){
        var new_template = raster_li_element_template.replace('###label',label);
        new_template = new_template.replace('###id',id);
        $('.selected-rasters').append(new_template);
    };

    var raster_already_in_list = function(id){
        rasters = [];
        $('.hidden-raster-id-value').each(function(index,value){
            rasters.push(parseInt($(this).text()))
        });
        return _.contains(rasters,id);
    }

    var update_selected_rasters = function(){
        var retVal = new Array();
        $('.hidden-raster-id-value').each(function(index,value){
            //retVal.push($(this).text());
            var new_template = hidden_input_template.replace('###id',index);
            new_template = new_template.replace('###value',$(this).text())
            $('.rasterlist_table').append(new_template);
        });
    };

    var clear_inputs = function(){
        $("input[id*='id_rasters_'").each(function(index,value){
            $(this).remove();
        });
    };

    $(document).on('click','a.close-raster',function(){
        var a = $(this);
        var li = a.parent();
        var ul = li.parent();
        li.remove();
        clear_inputs();
        update_selected_rasters();
    });

    if(raster_table.length > 0){
        clear_inputs();
    }
    for(var i = 0; i < raster_table.length; i++){
        var r = raster_table[i];
        add_raster_to_autocomplete(r.id,r.name);
    }
    update_selected_rasters();

} );

$(document).ready(function() {

    var raster_li_element_template = '<li class="tagit-choice ui-widget-content ui-state-default ui-corner-all tagit-choice-editable"><span class="tagit-label">###label</span><span class="hidden-raster-id-value">###id</span><a class="tagit-close close-raster"><span class="text-icon">x</span><span class="ui-icon ui-icon-close"></span></a></li>';

    $( "#rasters" ).autocomplete({
        source: '/api/geotiffs/',
        minLength: 2,
        select: function( event, ui ) {
            var label = ui.item.name;
            var id = ui.item.id;
            var new_template = raster_li_element_template.replace('###label',label);
            new_template = new_template.replace('###id',id);
            $('.selected-rasters').append(new_template);
            $('#rasters').val('');
            return false;
        }
    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
        return $( "<li>" )
            .append( "<div>" + item.name + "</div>" )
            .appendTo( ul );
    };

} );

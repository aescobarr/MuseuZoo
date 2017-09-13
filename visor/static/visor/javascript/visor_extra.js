var creua = function(){
    var tableRasters = $('#geotiff_list').DataTable();
    var tableFiles = $('#datafile_list').DataTable();
    var count_rasters = tableRasters.rows( { selected: true } ).count();
    var count_files = tableFiles.rows( { selected: true } ).count();
    if ( count_rasters < 1 || count_files < 1){
        alert("Cal triar com a mínim un ràster i un fitxer de dades");
    }else{
        var operation = instantiate_op();
        create_op(operation);
    }
};

var get_raster_ids = function(){
    var retVal = new Array();
    data = $('#geotiff_list').DataTable().rows({ selected: true } ).data()[0].id;
    retVal.push(data);
    return retVal;
};

var get_datafile_ids = function(){
    data = $('#datafile_list').DataTable().rows({ selected: true } ).data()[0].id;
    return data;
};

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


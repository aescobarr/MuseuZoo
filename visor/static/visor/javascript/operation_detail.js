$(document).ready(function() {
    var refresh_status = function(){
        $('#status-spinner').show();
        $.ajax({
            url: _json_datasource,
            method: "GET",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var csrftoken = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            },
            success: function( data, textStatus, jqXHR ) {
                 $('#status-spinner').hide();
                 $('#_td_status').html(data.status);
                 $('#_td_stacktrace').html(data.traceback);
                 $('#_td_timestamp').html(data.date_done);
                 $('#_td_results').html('<a href="/media/' + _result_file + '">' + _result_file + '</a>');
            },
            error: function(jqXHR, textStatus, errorThrown){
                $('#status-spinner').hide();
                alert("Error recuperant dades");
            }
        });
    };
    refresh_status();
} );

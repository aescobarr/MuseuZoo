$(document).ready(function() {

    var keep_reloading = true;

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
                 if(data.status == 'SUCCESS' || data.status == 'FAILURE'){
                    keep_reloading = false;
                 }
                 $('#_td_stacktrace').html(data.traceback);
                 $('#_td_timestamp').html(data.date_done);
                 $('#_td_results').html('<a href="/media/' + _result_file + '">' + _result_file + '</a>');
            },
            error: function(jqXHR, textStatus, errorThrown){
                $('#status-spinner').hide();
                //alert("Error recuperant dades");
            }
        });
    };

    window.setInterval(function(){
        if(keep_reloading){
            toastr.info("Refrescant pàgina...");
            refresh_status();
        }
    }, 10000);

    refresh_status();

} );

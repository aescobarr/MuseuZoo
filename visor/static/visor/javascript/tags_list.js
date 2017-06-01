$(document).ready(function() {
    $("#tags_list").tagit({
        singleField: true,
        autocomplete: {
            source: function( request, response ) {
                $.ajax({
                    url: "/api/tags/",
                    dataType: "json",
                    data: {
                        featureClass: "P",
                        style: "full",
                        maxRows: 12,
                        name: request.term
                    },
                    success: function( data ) {
                         response( $.map( data, function( item ) {
                            return {
                                label: item.name,
                                value: item.name
                            }
                         }));
                    }
                });
            },
            minLength: 2,
            preprocessTag: function (val) {
                if (!val) {
                    return '';
                }
                return val.toLowerCase();
            }
        }
    });
});
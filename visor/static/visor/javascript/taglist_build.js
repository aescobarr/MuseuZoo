    $(document).ready(function() {
        var buildTagsUI = function (){
            var tag_string = $("#id_tags").val();
            var tag_array = [];
            if(tag_string && tag_string != 'na' && tag_string != ''){
                tag_array = tag_string.split(",");
                $("#tags_list").tagit("removeAll");
                for(var i = 0; i < tag_array.length; i++){
                    $("#tags_list").tagit("createTag", tag_array[i]);
                }
            }
        };

        buildTagsUI();
    } );
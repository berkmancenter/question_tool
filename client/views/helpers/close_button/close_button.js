Template.close_button.events({
    "click .closecontainer": function(event, template) {
        $(".formcontainer").fadeOut(200);
        $("#darker").fadeOut(200, function() {
            Blaze.remove(popoverTemplate);
        });
    }
});
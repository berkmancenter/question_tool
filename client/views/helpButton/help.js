Template.helpButton.onRendered(function() {
  $(".formcontainer").hide().fadeIn(400);
  $("#darker").hide().fadeIn(400);
});

Template.helpButton.events({
  "click #shareclosebutton": function(event, template) {
    $(".formcontainer").fadeOut(400);
    $("#darker").fadeOut(400, function() {
      Blaze.remove(popoverTemplate);
    });
  }
});
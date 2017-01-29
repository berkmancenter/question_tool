Template.credits.onRendered(function() {
  // Sets the document title when the template is rendered
  $(".formcontainer").hide().fadeIn(400);

});

Template.credits.events({
  "click .closecontainer": function(event, template) {
    Blaze.remove(popoverTemplate);
  }
});
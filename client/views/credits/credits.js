Template.credits.onRendered(() => {
  // Sets the document title when the template is rendered
  $('.formcontainer').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars */
Template.credits.events({
  'click .closecontainer': function (event, template) {
    Blaze.remove(popoverTemplate);
  },
});
/* eslint-enable func-names, no-unused-vars */

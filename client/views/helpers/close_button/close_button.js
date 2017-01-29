/* eslint-disable func-names, no-unused-vars */
Template.close_button.events({
  'click .closecontainer': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
/* eslint-disable func-names, no-unused-vars */

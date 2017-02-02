/* eslint-disable func-names, no-unused-vars */
function removePopover() {
  $('.formcontainer').fadeOut(400);
  $('#darker').fadeOut(400, () => {
    Blaze.remove(popoverTemplate);
  });
}

Template.close_button.onCreated(function () {
  $(document).keydown((e) => {
    if (popoverTemplate && e.keyCode === 27) {
      removePopover();
    }
  });
});

Template.close_button.events({
  'click .closecontainer': function (event, template) {
    removePopover();
  },
});
/* eslint-disable func-names, no-unused-vars */

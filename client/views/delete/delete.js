Template.delete.onRendered(() => {
  // When the template is rendered, sets the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars */
function removePopover() {
  $('.formcontainer').fadeOut(400);
  $('#darker').fadeOut(400, () => {
    Blaze.remove(popoverTemplate);
  });
}

Template.delete.events({
  'click .deletebutton': function (event, template) {
    const instanceid = template.data._id;
    Meteor.call('adminRemove', instanceid, (error, result) => {
      if (!result) {
        if (typeof currentError !== 'undefined') {
          Blaze.remove(currentError);
        }
        const e = 'An error has occurred while trying to delete the instance. Please try again.';
        currentError = Blaze.renderWithData(Template.form_error, e, document.getElementsByClassName("deleteError")[0]);
      } else {
        removePopover();
        Router.go('/');
      }
    });
  },
  'click #darker, click .cancelbutton': function (event, template) {
    removePopover();
  },
});
/* eslint-enable func-names, no-unused-vars */

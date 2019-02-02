Template.form_error.onRendered(() => {
  $('.error').hide().fadeIn(400);
  setTimeout(function(){ $('.error').fadeOut(400); }, 5000);
  
});

/* eslint-disable func-names, no-unused-vars */
Template.form_error.events({
  'click .error-dismiss': function (event, template) {
    Blaze.remove(currentError);
  },
});

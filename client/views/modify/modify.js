import { Questions } from '/lib/common.js';

function showModifyError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.modify.onCreated(() => {
  // Checks whether the user has a valid table cookie
  Meteor.call('cookieCheck', Session.get('tablename'), (error, result) => {
    if (!result) {
      // If not, redirect back to the chooser page
      window.location.href = '/';
    } else {
      // Checks whether the user has proper admin privileges
      Meteor.call('adminCheck', Session.get('id'), (e, r) => {
        if (!r) {
          // If not, redirects back to the list page
          window.location.href = '/list';
        }
      });
    }
  });
});

Template.modify.onRendered(() => {
  // When the template is rendered, sets the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.modify.helpers({
  questiontext() {
    return Questions.findOne({
      _id: Template.instance().data,
    }).text;
  },
  maxmodlength() {
    return Session.get('questionLength');
  },
});

/* eslint-disable func-names, no-unused-vars */
Template.modify.events({
  // When the submit button is clicked...
  'click .modifysubmitbutton': function (event, template) {
    // Retrieves data from the form
    const question = document.getElementsByName('comment')[0].value;
    if (!question) {
      showModifyError('Please enter a question.');
      return false;
    }
    // Calls the server-side "modify" method to update the DBs
    Meteor.call('modify', question, event.currentTarget.id, Session.get('id'), (error, result) => {
      if (result) {
        // If successful, redirect back to the list page
        // window.location.href = "/list";
        $('.formcontainer').fadeOut(400);
        $('#darker').fadeOut(400, () => {
          Blaze.remove(popoverTemplate);
        });
      }
    });
  },
  // If the enter key is pressed, submit the form
  'keypress #modifybox': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      document.getElementById('submitbutton').click();
    }
  },
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
/* eslint-enable func-names, no-unused-vars */

import { Questions, Instances } from '/lib/common.js';

function showModifyError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.modify.onCreated(() => {
  const quest = Template.instance().data;
  Meteor.call('canModify', quest, (e, r) => {
    if (!r) {
      // If not, redirects back to the list page
      const instanceid = Questions.findOne({ _id: quest }).instanceid;
      const slug = Instances.findOne({ _id: instanceid }).slug;
      window.location.href = '/list/' + slug;
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
    const instanceid = Questions.findOne({ _id: Template.instance().data }).instanceid;
    return Instances.findOne({ _id: instanceid }).max_question;
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
    Meteor.call('modify', question, event.currentTarget.id, (error, result) => {
      if (result) {
        // If successful, redirect back to the list page
        // window.location.href = "/list";
        $('.formcontainer').fadeOut(400);
        $('#darker').fadeOut(400, () => {
          Blaze.remove(popoverTemplate);
          window.location.reload();
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

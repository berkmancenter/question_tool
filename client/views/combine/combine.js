import { Questions } from '/lib/common.js';

function showError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.combine.onCreated(function () {
  Meteor.call('adminCheck', this.data.instanceid, (e, r) => {
    if (!r) {
      // If not, redirects back to the list page
      window.location.href = '/';
    }
  });
});

Template.combine.onRendered(() => {
  // Sets the document title when the template is rendered
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
  // console.log(Template.instance().data);
});

Template.combine.helpers({
  firsttext() {
    return Questions.findOne({
      _id: Template.instance().data.first,
    }).text.trim();
  },
  secondtext() {
    return Questions.findOne({
      _id: Template.instance().data.second,
    }).text.trim();
  },
});

/* eslint-disable func-names, no-unused-vars */
Template.combine.events({
  // When the submit button is clicked...
  'click .combinesubmitbutton': function (event, template) {
    // Retrieves data from form
    const question = document.getElementById('modifybox').value;
    // Calls the combine function on the server to update the DBs
    const id2 = Template.instance().data.second;
    const id1 = Template.instance().data.first;
    Meteor.call('combine', question, id1, id2, (error, result) => {
      // If successful
      if (typeof result !== 'object') {
        window.location.reload();
      } else if (result[0].name === 'text') {
        showError('Question can\'t be longer than 500 characters.', 'inputcontainer', 'modifybox');
      } else {
        showError('An unexpected error occurred, please try again.', 'inputcontainer', 'modifybox');
      }
    });
  },
  // When enter button is pressed, submit the form
  'keypress #modifybox': function (event, template) {
    // eslint-disable-next-line no-param-reassign
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
    window.location.reload();
  },
  'click .closecontainer': function (event, template) {
    window.location.reload();
  },
});

/* eslint-enable func-names, no-unused-vars */

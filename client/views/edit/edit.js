import { Instances } from '/lib/common.js';

function showEditAdvError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.edit.onRendered(() => {
  // When the template is rendered, set the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.edit.events({
  'click .editsubmitbutton': function (event, template) {
    const table = Template.instance().data.table;
    const thresholdSelect = document.getElementsByName('threshold')[0];
    const threshold = thresholdSelect[thresholdSelect.selectedIndex].value;
    const questionSelect = document.getElementsByName('max_question')[0];
    const maxQuestion = questionSelect[questionSelect.selectedIndex].value;
    const responseSelect = document.getElementsByName('max_response')[0];
    const maxResponse = responseSelect[responseSelect.selectedIndex].value;
    const lengthSelect = document.getElementsByName('new_length')[0];
    const redLength = lengthSelect[lengthSelect.selectedIndex].value;
    const staleSelect = document.getElementsByName('stale_length')[0];
    const stale = staleSelect[staleSelect.selectedIndex].value;
    const hiddenSelector = document.getElementsByName('visibility')[0];
    const isHidden = (hiddenSelector[hiddenSelector.selectedIndex].value === 'hidden');
    console.log("New parameters: ",threshold, maxQuestion, maxResponse, redLength, stale, isHidden);
    Meteor.call('editadv', table._id, threshold, maxQuestion, maxResponse, redLength, stale, isHidden, (error, result) => {
      console.log("result is: ",result);
      if (typeof result === 'object') {
        const errorCodes = {
          tablename: 'Please enter a valid instance name using only letters and numbers, no spaces.',
          threshold: "Please enter a valid # of 'featured' questions using the drop down menu.",
          new_length: "Please enter a valid value using the 'new questions' drop down menu.",
          stale_length: "Please enter a valid value using the 'old questions' drop down menu.",
          description: 'Please enter a valid description under 255 characters.',
          moderators: 'You have entered too many moderators. Please try again.',
        };
        // Alert the error
        showEditAdvError(errorCodes[result[0].name]);
      } else if (result) {
        const isList = template.data.isList;
        console.log(template.data);
        if (isList) {
          window.location.href = '/list/' + Instances.findOne({ _id: table._id }).slug;
        } else {
          Blaze.remove(popoverTemplate);
        }
      } else {
        showRenameError('Insufficient permissions.');
      }
    });
  },
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
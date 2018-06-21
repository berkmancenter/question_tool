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

Template.edit.helpers({
  // threshold
  thresholdFirst() {
    return (Template.instance().data.table.threshold === 2) ? 'selected' : '';
  },
  thresholdSecond() {
    return (Template.instance().data.table.threshold === 4) ? 'selected' : '';
  },
  thresholdThird() {
    return (Template.instance().data.table.threshold === 6) ? 'selected' : '';
  },
  thresholdFourth() {
    return (Template.instance().data.table.threshold === 8) ? 'selected' : '';
  },
  // max_question
  maxQuestionFirst() {
    return (Template.instance().data.table.max_question === 250) ? 'selected' : '';
  },
  maxQuestionSecond() {
    return (Template.instance().data.table.max_question === 300) ? 'selected' : '';
  },
  maxQuestionThird() {
    return (Template.instance().data.table.max_question === 350) ? 'selected' : '';
  },
  maxQuestionFourth() {
    return (Template.instance().data.table.max_question === 400) ? 'selected' : '';
  },
  maxQuestionFifth() {
    return (Template.instance().data.table.max_question === 450) ? 'selected' : '';
  },
  // maxresponse
  maxResponseFirst() {
    return (Template.instance().data.table.max_response === 100) ? 'selected' : '';
  },
  maxResponseSecond() {
    return (Template.instance().data.table.max_response === 150) ? 'selected' : '';
  },
  maxResponseThird() {
    return (Template.instance().data.table.max_response === 200) ? 'selected' : '';
  },
  maxResponseFourth() {
    return (Template.instance().data.table.max_response === 250) ? 'selected' : '';
  },
  maxResponseFifth() {
    return (Template.instance().data.table.max_response === 300) ? 'selected' : '';
  },
  // new_length
  newLengthFirst() {
    return (Template.instance().data.table.new_length === 30) ? 'selected' : '';
  },
  newLengthSecond() {
    return (Template.instance().data.table.new_length === 60) ? 'selected' : '';
  },
  newLengthThird() {
    return (Template.instance().data.table.new_length === 300) ? 'selected' : '';
  },
  newLengthFourth() {
    return (Template.instance().data.table.new_length === 3600) ? 'selected' : '';
  },
  newLengthFifth() {
    return (Template.instance().data.table.new_length === 86400) ? 'selected' : '';
  },
  newLengthSixth() {
    return (Template.instance().data.table.new_length === 604800) ? 'selected' : '';
  },
  // stale_length
  staleFirst() {
    return (Template.instance().data.table.stale_length === 900) ? 'selected' : '';
  },
  staleSecond() {
    return (Template.instance().data.table.stale_length === 1800) ? 'selected' : '';
  },
  staleThird() {
    return (Template.instance().data.table.stale_length === 3600) ? 'selected' : '';
  },
  staleFourth() {
    return (Template.instance().data.table.stale_length === 86400) ? 'selected' : '';
  },
  staleFifth() {
    return (Template.instance().data.table.stale_length === 604800) ? 'selected' : '';
  },
  staleSixth() {
    return (Template.instance().data.table.stale_length === 2592000) ? 'selected' : '';
  },
  staleLengthSeventh() {
    return (Template.instance().data.table.stale_length === 31557600) ? 'selected' : '';
  },
  // hidden
  visibilityFirst() {
    return (Template.instance().data.table.hidden === false) ? 'selected' : '';
  },
  visibilitySecond() {
    return (Template.instance().data.table.hidden === true) ? 'selected' : '';
  },
  // social
  socialFirst() {
    return (Template.instance().data.table.social === true) ? 'selected' : '';
  },
  socialSecond() {
    return (Template.instance().data.table.social === false) ? 'selected' : '';
  },
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
    const socialSelector = document.getElementsByName('social')[0];
    const social = (socialSelector[socialSelector.selectedIndex].value === 'on');
    // console.log("New parameters: ",threshold, maxQuestion, maxResponse, redLength, stale, isHidden, social);
    Meteor.call('editadv', table._id, threshold, maxQuestion, maxResponse, redLength, stale, isHidden, social, (error, result) => {
      if (error) {
        const errorCodes = {
          threshold: "Please enter a valid # of 'featured' questions using the drop down menu.",
          new_length: "Please enter a valid value in the 'New questions are highlighted for' drop down menu.",
          stale_length: "Please enter a valid value in the 'Old questions are highlighted after' drop down menu.",
          max_question: "Please enter a valid value in the 'Question max word count' drop down menu.",
          max_response: "Please enter a valid value in the 'Response max word count' drop down menu.",
          hidden: "Please enter a valid value in the 'visibility of instance' drop down menu.",
          social: "Please enter a valid value in the 'Social media sharing' drop down menu.",
        };
        showEditAdvError(errorCodes[error.error]);
      } else {
        const isList = template.data.isList;
        console.log(template.data);
        if (isList) {
          window.location.href = '/list/' + Instances.findOne({ _id: table._id }).slug;
        } else {
          Blaze.remove(popoverTemplate);
        }
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

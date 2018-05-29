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
  thresholdFirst: function () {
    return (Template.instance().data.table.threshold === 2) ? 'selected' : '';
  },
  thresholdSecond: function () {
    return (Template.instance().data.table.threshold === 4) ? 'selected' : '';
  },
  thresholdThird: function () {
    return (Template.instance().data.table.threshold === 6) ? 'selected' : '';
  },
  thresholdFourth: function () {
    return (Template.instance().data.table.threshold === 8) ? 'selected' : '';
  },
  // max_question
  maxQuestionFirst: function () {
    return (Template.instance().data.table.max_question === 250) ? 'selected' : '';
  },
  maxQuestionSecond: function () {
    return (Template.instance().data.table.max_question === 300) ? 'selected' : '';
  },
  maxQuestionThird: function () {
    return (Template.instance().data.table.max_question === 350) ? 'selected' : '';
  },
  maxQuestionFourth: function () {
    return (Template.instance().data.table.max_question === 400) ? 'selected' : '';
  },
  maxQuestionFifth: function () {
    return (Template.instance().data.table.max_question === 450) ? 'selected' : '';
  },
  // maxresponse
  maxResponseFirst: function () {
    return (Template.instance().data.table.max_response === 100) ? 'selected' : '';
  },
  maxResponseSecond: function () {
    return (Template.instance().data.table.max_response === 150) ? 'selected' : '';
  },
  maxResponseThird: function () {
    return (Template.instance().data.table.max_response === 200) ? 'selected' : '';
  },
  maxResponseFourth: function () {
    return (Template.instance().data.table.max_response === 250) ? 'selected' : '';
  },
  maxResponseFifth: function () {
    return (Template.instance().data.table.max_response === 300) ? 'selected' : '';
  },
  // new_length
  newLengthFirst: function () {
    return (Template.instance().data.table.new_length === 30) ? 'selected' : '';
  },
  newLengthSecond: function () {
    return (Template.instance().data.table.new_length === 60) ? 'selected' : '';
  },
  newLengthThird: function () {
    return (Template.instance().data.table.new_length === 300) ? 'selected' : '';
  },
  newLengthFourth: function () {
    return (Template.instance().data.table.new_length === 3600) ? 'selected' : '';
  },
  newLengthFifth: function () {
    return (Template.instance().data.table.new_length === 86400) ? 'selected' : '';
  },
  newLengthSixth: function () {
    return (Template.instance().data.table.new_length === 604800) ? 'selected' : '';
  },
  // stale_length
  staleFirst: function () {
    return (Template.instance().data.table.stale_length === 900) ? 'selected' : '';
  },
  staleSecond: function () {
    return (Template.instance().data.table.stale_length === 1800) ? 'selected' : '';
  },
  staleThird: function () {
    return (Template.instance().data.table.stale_length === 3600) ? 'selected' : '';
  },
  staleFourth: function () {
    return (Template.instance().data.table.stale_length === 86400) ? 'selected' : '';
  },
  staleFifth: function () {
    return (Template.instance().data.table.stale_length === 604800) ? 'selected' : '';
  },
  staleSixth: function () {
    return (Template.instance().data.table.stale_length === 2592000) ? 'selected' : '';
  },
  staleLengthSeventh: function () {
    return (Template.instance().data.table.stale_length === 31557600) ? 'selected' : '';
  },
  // hidden
  visibilityFirst: function () {
    return (Template.instance().data.table.hidden === false) ? 'selected' : '';
  },
  visibilitySecond: function () {
    return (Template.instance().data.table.hidden === true) ? 'selected' : '';
  },
  // social
  socialFirst: function () {
    return (Template.instance().data.table.social === true) ? 'selected' : '';
  },
  socialSecond: function () {
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
    console.log("New parameters: ",threshold, maxQuestion, maxResponse, redLength, stale, isHidden, social);
    Meteor.call('editadv', table._id, threshold, maxQuestion, maxResponse, redLength, stale, isHidden, social, (error, result) => {
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
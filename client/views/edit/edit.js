import { Instances } from '/lib/common.js';
import $ from 'jquery'

function showEditAdvError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = $('.formcontainer')[0];
  const nextNode =  $('.inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.edit.onRendered(() => {
  // When the template is rendered, set the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.edit.helpers({
  isSelected(property, value) {
    return Template.instance().data.table[property] === value ? 'selected' : '';
  },
});

Template.edit.events({
  'click .editsubmitbutton': function (event, template) {
    const table = Template.instance().data.table;
    const threshold = template.$('select[name=threshold]').val();
    const maxQuestion = template.$('select[name=max_question]').val();
    const maxResponse = template.$('select[name=max_response]').val();
    const redLength = template.$('select[name=new_length]').val();
    const stale = template.$('select[name=stale_length]').val();
    const isHidden = (template.$('select[name=visibility]').val() === 'hidden');
    const social = (template.$('select[name=social]').val() === 'on');
    const newValues = {
      threshold: parseInt(threshold),
      new_length: parseInt(redLength),
      stale_length: parseInt(stale),
      max_question: parseInt(maxQuestion),
      max_response: parseInt(maxResponse),
      hidden: isHidden,
      social: social,
    };
    Meteor.call('editadv', table._id, newValues, (error, result) => {
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

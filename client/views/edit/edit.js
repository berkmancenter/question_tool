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
  isSelected(property, value) {
    return Template.instance().data.table[property] === value ? 'selected' : '';
  },
});

Template.edit.events({
  'click .editsubmitbutton': function (event, template) {
    const table = Template.instance().data.table;
    const threshold = $('select[name=threshold]')[0].value;
    const maxQuestion = $('select[name=max_question]')[0].value;
    const maxResponse = $('select[name=max_response]')[0].value;
    const redLength = $('select[name=new_length]')[0].value;
    const stale = $('select[name=stale_length]')[0].value;
    const isHidden = ($('select[name=visibility]')[0].value === 'hidden');
    const social = ($('select[name=social]')[0].value === 'on');
    const newValues = {
      threshold: Number(threshold),
      new_length: Number(redLength),
      stale_length: Number(stale),
      max_question: Number(maxQuestion),
      max_response: Number(maxResponse),
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

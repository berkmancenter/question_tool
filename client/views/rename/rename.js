import { Instances } from '/lib/common.js';

function showRenameError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.rename.onRendered(() => {
  // When the template is rendered, set the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars */
Template.rename.events({
  'click .renamesubmitbutton': function (event, template) {
    const newName = document.getElementById('namebox').value;
    const table = Template.instance().data.table;
    let newDesc = document.getElementById('descriptionbox').value;
    newDesc = newDesc.charAt(0).toUpperCase() + newDesc.slice(1);
    newDesc = UniHTML.purify(newDesc, { withoutTags: ['a', 'img', 'ol', 'ul', 'span', 'br', 'table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thread', 'tr', 'li'] });
    // if (newName === table.tablename && newDesc === table.description) {
    //   return false;
    // }
    Meteor.call('rename', table._id, newName, newDesc, (error, result) => {
      if (typeof result === 'object') {
        const errors = {
          description: 'Description should be at most 500 chars.',
          tablename: 'Name can only contain 4 to 30 alphanumeric characters.',
        };
        showRenameError(errors[result[0].name]);
      } else if (result) {
        const isList = template.data.isList;
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
  // If the enter key is pressed, submit the form
  'keypress #namebox': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      document.getElementsByClassName('renamesubmitbutton')[0].click();
    }
  },
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
/* eslint-disable func-names, no-unused-vars */

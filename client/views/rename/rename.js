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
    if (newName === table.tablename && newDesc === table.description) {
      return false;
    }
    Meteor.call('rename', table._id, newName, newDesc, (error, result) => {
      if (result === 2) {
        showRenameError('Insufficient permissions.');
      } else if (result === 1) {
        showRenameError('Name is already taken.');
      } else {
        const isList = template.data.isList;
        if (isList) {
          const instance = Instances.findOne({
            _id: Session.get('id'),
          });
          window.location.href = '/list/' + instance.slug;
        } else {
          Blaze.remove(popoverTemplate);
        }
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

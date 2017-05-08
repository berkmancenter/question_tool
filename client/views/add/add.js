import { Instances } from '/lib/common.js';

function showModsError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.add.onCreated(function () {
  this.numberOfNewMods = new ReactiveVar(1);
  if (this.data.admin !== Meteor.user().emails[0].address) {
    Router.go('/');
  }
});

Template.add.helpers({
  mods() {
    return Instances.findOne({ _id: Template.instance().data._id }, { reactive: true }).moderators;
  },
  newMod() {
    return Template.instance().numberOfNewMods.get();
  },
  loop(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({});
    }
    return arr;
  },
});

Template.add.onRendered(() => {
  // When the template is rendered, set the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars, consistent-return */
Template.add.events({
  'click .plusbutton': function (event, template) {
    const row = event.currentTarget.parentElement;
    const modBoxes = document.getElementsByClassName('modbox');
    if (modBoxes.length >= 4) {
      showModsError("You've reached max of 4 moderators.");
      return false;
    }
    const buttons = row.getElementsByClassName('plusbutton');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.display = 'none';
    }
    template.numberOfNewMods.set(template.numberOfNewMods.get() + 1);
  },
  'click .removebutton': function (event, template) {
    const mod = $(event.currentTarget).data('email');
    Meteor.call('removeMods', mod, template.data._id);
  },
  // When the submit button is clicked...
  'click #modsdonebutton': function (event, template) {
    // Checks whether the proper password was submitted
    const modsInput = document.getElementsByClassName('newmod');
    const mods = [];
    for (let m = 0; m < modsInput.length; m++) {
      if (modsInput[m].value) {
        mods.push(modsInput[m].value);
      }
    }
    Meteor.call('addMods', mods, template.data._id, (error, result) => {
      // If the result is an object, there was an error
      if (typeof result === 'object') {
        // Alert the error
        for (let i = 0; i < result.length; i++) {
          if (result[i].name === 'moderators') {
            showModsError('You can only assign 4 moderators per instance.');
            return false;
          }
        }
        showModsError('Please enter valid email addresses.');
        return false;
      }
      for (let m = 0; m < mods.length; m++) {
        Meteor.call('sendEmail',
                    mods[m],
                    Meteor.user().emails[0].address,
                    'You have been added as a moderator on Question Tool',
                    Meteor.user().profile.name + ' added you as a moderator of ' + template.data.tablename + ' at ' + Iron.Location.get().originalUrl + ' on Question Tool. You are able to modify, combine, and hide questions. You must use this email address when registering to be considered a moderator.');
      }
      let boxes = document.getElementsByClassName('newmod');
      boxes = boxes[boxes.length - 1];
      boxes.value = '';
      $('.formcontainer').fadeOut(400);
      $('#darker').fadeOut(400, () => {
        Blaze.remove(popoverTemplate);
      });
    });
  },
  // If the enter key is pressed, submit the form
  'keypress .modbox': function (event, template) {
    event.which = event.which || event.keyCode; // eslint-disable-line no-param-reassign
    if (event.which === 13) {
      event.preventDefault();
      document.getElementsByClassName('plusbutton')[0].click();
      const fields = document.getElementsByClassName('modbox');
      fields[fields.length - 1].focus();
    }
  },
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
/* eslint-enable func-names, no-unused-vars, consistent-return */

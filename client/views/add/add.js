import { Instances } from '/lib/common.js';

function showModsError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

function checkPrevMod(modBoxes) {
  const modBoxesArray = Array.from(modBoxes);
  const modEmails = modBoxesArray.map(b => b.value); // has all the emails
  const currMail = modBoxes[modBoxes.length - 1].value; // has last email
  const occurrences = modEmails.filter(val => val === currMail).length;
  return occurrences === 1;
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
    if (checkPrevMod(modBoxes) === false) {
      showModsError('Email ID was already added as a moderator.');
      return false;
    }
    const buttons = row.getElementsByClassName('plusbutton');
    const minusButton = row.getElementsByClassName('minusbutton');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.display = 'none';
      minusButton[i].style.display = 'inline-block';
    }
    template.numberOfNewMods.set(template.numberOfNewMods.get() + 1);
  },
  'click .minusbutton': function(event, template) {
    event.currentTarget.parentElement.remove();
  },
  'click .removebutton': function (event, template) {
    const mod = $(event.currentTarget).data('email');
    Meteor.call('removeMods', mod, template.data._id);
  },
  // When the submit button is clicked...
  'click #modsdonebutton': function (event, template) {
    const modBoxes = document.getElementsByClassName('modbox');
    const modBoxesArray = Array.from(modBoxes);
    const allEmails = template.data.moderators;
    const modEmails = modBoxesArray.map(b => b.value);
    const newMods = modEmails.filter(value => !allEmails.includes(value));
    const occurrences = modEmails.filter(val => val !== "").length;
    if (checkPrevMod(modBoxes) === false) {
      showModsError('Email ID was already added as a moderator.');
      return false;
    }
    const modsInput = document.getElementsByClassName('newmod');
    const mods = [];
    for (let m = 0; m < modsInput.length; m++) {
      if (modsInput[m].value) {
        mods.push(modsInput[m].value);
      }
    }
    Meteor.call('addMods', mods, template.data._id, (error, response) => {
      console.log(response);
      if (typeof response === 'object' && response['status_code'] === false && response['result'].length > 0) {
        // Alert the error
        for (let i = 0; i < response['result'].length; i++) {
          // Check is the server returned error corresponding to the addition of owner as moderator
          if(response['result'][i].name === 'owner') {
            // Display the error message
            showModsError(`${response['result'][i].value} is already an owner of the instance and has the privileges of a moderator.`);
            return false;
          }
        }
        showModsError('Please enter valid email addresses.');
        return false;
      } else if (typeof response === 'object' && response['status_code'] === true && response['result'].length > 0) {
        for(let k = 0; k < response['result'].length; k++) {
          Accounts.forgotPassword({email: response['result'][k]}, function(err) {
            if (err) {
              console.log(err);
            }
          })
        }
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

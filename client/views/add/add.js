Template.add.onCreated(() => {
  // Checks whether the user has a valid table cookie
  Meteor.call('listCookieCheck', Session.get('id'), (error, result) => {
    if (!result) {
      // If not, return the user to the chooser page
      window.location.href = '/';
    } else {
      Meteor.call('adminCheck', Session.get('id'), (error, result) => {
        if (!result) {
          // If not, return the user to the chooser page
          window.location.href = '/';
        }
      });
    }
  });
});

Template.add.onRendered(() => {
  // When the template is rendered, set the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.add.helpers({
  // Sets the template tablename to the tablename Cookie
  tablename: Session.get('tablename'),
  mods() {
    const instance = Instances.findOne({
      tablename: Session.get('tablename'),
    }, {
      reactive: true,
    });
    const mods = [];
    for (let m = 0; m < instance.moderators.length; m++) {
      mods.push(instance.moderators[m]);
    }
    return mods;
  },
});

Template.add.events({
  'click .plusbutton': function (event, template) {
    const row = event.currentTarget.parentElement;
    const modBoxes = document.getElementsByClassName('modbox');
    if (modBoxes.length > 4) {
      showModsError("You've reached max of 4 moderators.");
      return false;
    }
    const buttons = row.getElementsByClassName('plusbutton');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].style.display = 'none';
    }
    let line = document.createElement('div'),
      input = document.createElement('input'),
      plus = document.createElement('div');
    line.className = 'modline';
    input.type = 'text';
    input.style.clear = 'both';
    input.maxLength = '45';
    input.className = 'modbox newmod';
    plus.className = 'plusbutton';
    plus.innerHTML = '+';
    line.appendChild(input);
    line.appendChild(plus);
    row.appendChild(line);
  },
  'click .removebutton': function (event, template) {
    const mod = event.currentTarget.previousElementSibling.value;
    Meteor.call('removeMods', mod, Session.get('id'));
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
    Meteor.call('addMods', mods, Session.get('id'), (error, result) => {
      console.log(Meteor.user().emails[0].address);
      for (let m = 0; m < mods.length; m++) {
        Meteor.call('sendEmail',
                    mods[m],
                    Meteor.user().emails[0].address,
                    'You have been added as a moderator on Question Tool',
                    Meteor.user().profile.name + ' added you as a moderator of ' + Session.get('tablename') + ' at ' + Iron.Location.get().originalUrl + ' on Question Tool. You are able to modify, combine, and hide questions. You must use this email address when registering to be considered a moderator.');
      }
      // If the result is an object, there was an error
      if (typeof result === 'object') {
        // Alert the error
        showModsError('Please enter valid email addresses.');
        return false;
      } else {
        let boxes = document.getElementsByClassName('newmod');
        boxes = boxes[boxes.length - 1];
        boxes.value = '';
        $('.formcontainer').fadeOut(400);
        $('#darker').fadeOut(400, () => {
          Blaze.remove(popoverTemplate);
        });
      }
    });
  },
  // If the enter key is pressed, submit the form
  'keypress .modbox': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which == 13) {
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

function showModsError(reason) {
  if (typeof currentError != 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('formcontainer')[0];
  const nextNode = document.getElementsByClassName('inputcontainer')[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

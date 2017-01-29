function showError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.register.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars */
Template.register.events({
  'keypress #passwordconfirm': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      document.getElementById('registersubmitbutton').click();
    }
  },
  'click #registersubmitbutton': function (event, template) {
    // 1. All the values
    const email = document.getElementById('loginemail').value;
    const loginName = document.getElementById('loginname').value;
    const password1 = document.getElementById('passwordbox').value;
    const password2 = document.getElementById('passwordconfirm').value;

    // 2. Front-end validation
    if (!$('#loginname')[0].checkValidity()) {
      let nameError = 'Please enter a name';
      if (loginName.length > 0) nameError += ' between 3 and 30 characters.';
      else nameError += '.';
      showError(nameError, 'inputcontainer', 'loginemail');
      return false;
    } else if (!$('#loginemail')[0].checkValidity()) {
      let emError = 'Enter a valid email address';
      if (email.length === 0) {
        emError = 'Enter an email address.';
      } else if (email.length < 7 || email.length > 50) {
        emError += ' between 7 and 50 characters.';
      } else {
        emError += '.';
      }
      showError(emError, 'inputcontainer', 'loginemail');
      return false;
    } else if (!$('#passwordbox')[0].checkValidity()) {
      showError('Password must be between 6 and 30 characters', 'inputcontainer', 'loginemail');
      return false;
    } else if (password1 !== password2) {
      showError('Passwords do not match.', 'inputcontainer', 'loginemail');
      return false;
    }

    // 3. Back-end call
    Meteor.call('register', email, password2, loginName, (error, result) => {
      if (result === 3) {
        showError('Account with email already exists.', 'inputcontainer', 'loginemail');
        return false;
      } else if (result === 4) {
        showError('Enter a name using less than 30 characters.', 'inputcontainer', 'loginemail');
        return false;
      } else if (result === 5) {
        showError('Email must be between 7 and 50 characters.', 'inputcontainer', 'loginemail');
        return false;
      } else if (result === 1) {
        showError('Enter a name and email address.', 'inputcontainer', 'loginemail');
        return false;
      } else if (result === 2) {
        showError('Enter a valid email address.', 'inputcontainer', 'loginemail');
        return false;
      } else if (result === 6) {
        showError('Password must be between 6 and 30 characters.', 'inputcontainer', 'loginemail');
        return false;
      }
      Meteor.loginWithPassword(email, password2, (e) => {
        if (!e) {
          $('.formcontainer').fadeOut(400);
          $('#darker').fadeOut(400, () => {
            Blaze.remove(popoverTemplate);
          });
        }
      });
    });
  },
  'click #loginemphasis': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
      window.setTimeout(() => {
        const parentNode = document.getElementById('nav');
        popoverTemplate = Blaze.render(Template.login, parentNode);
      }, 10);
    });
  },
});
/* eslint-enable func-names, no-unused-vars */

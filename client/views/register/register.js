function showRegisterError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName('inputcontainer')[0];
  const nextNode = document.getElementById('loginemail');
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
      if (loginName.length === 0) {
        nameError += '.';
      } else if (loginName.length < 2 || loginName.length > 30) {
        nameError += ' between 2 and 30 characters.';
      } else {
        nameError += ' with only letters, numbers, spaces, dashes, or underscores.';
      }
      showRegisterError(nameError);
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
      showRegisterError(emError);
      return false;
    } else if (!$('#passwordbox')[0].checkValidity()) {
      showRegisterError('Password must be between 6 and 30 characters');
      return false;
    } else if (password1 !== password2) {
      showRegisterError('Passwords do not match.');
      return false;
    }

    // 3. Back-end call
    Meteor.call('register', email, password2, loginName, (error, result) => {
      if (typeof result === 'object') {
        const keys = {
          missingfield: 'Email, name, and password are required.',
          name: 'Name must be less than 30 characters.',
          systemname: 'Name cannot be "System" or "The System".',
          email: 'Enter a valid email between 7 & 50 characters.',
          password: 'Password must be between 6 & 30 characters.',
          exists: 'An account with that email already exists.',
          unknown: 'An unknown error occurred. Please try again.',
          alphanumeric: 'Name must have at least one alphanumeric character.',
        };
        showRegisterError(keys[result[0].name]);
      } else if (!error) {
        Meteor.loginWithPassword(email, password2, (e) => {
          if (!e) {
            $('.formcontainer').fadeOut(400);
            $('#darker').fadeOut(400, () => {
              Blaze.remove(popoverTemplate);
            });
          } else {
            showRegisterError('Account registered, but an error occurred while logging in. Please try again.');
          }
        });
      } else {
        showRegisterError('An unknown error occurred. Please try again.');
      }
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

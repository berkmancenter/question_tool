function showError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.login.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

/* eslint-disable func-names, no-unused-vars */
Template.login.events({
  'click #loginsubmitbutton': function (event, template) {
    const email = document.getElementById('loginemail').value;
    const password = document.getElementById('passwordbox').value;
    if (!email) {
      showError('Please enter a valid email address.', 'inputcontainer', 'loginemail');
      return false;
    } else if (!password) {
      showError('Please enter a valid password.', 'inputcontainer', 'loginemail');
      return false;
    }
    Meteor.loginWithPassword(email, password, (error) => {
      if (!error) {
        window.location.reload();
      } else {
        showError(error.reason, 'inputcontainer', 'loginemail');
      }
    });
  },
  'click #registeremphasis': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
      window.setTimeout(() => {
        const parentNode = document.getElementById('nav');
        popoverTemplate = Blaze.render(Template.register, parentNode);
      }, 10);
    });
  },
  'click #forgotpasswordemphasis': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
      window.setTimeout(() => {
        const parentNode = document.getElementById('nav');
        popoverTemplate = Blaze.render(Template.ForgotPassword, parentNode);
      }, 10);
    });
  },
  'keypress #passwordbox': function (event, template) {
    // eslint-disable-next-line no-param-reassign
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      document.getElementById('loginsubmitbutton').click();
    }
  },
});
/* eslint-enable func-names, no-unused-vars */

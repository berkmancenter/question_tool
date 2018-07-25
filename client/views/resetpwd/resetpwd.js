import $ from 'jquery'

Accounts.onResetPasswordLink((token, done) => {
  Router.go("resetpwd");
})

if (Accounts._resetPasswordToken) {
  Session.set('resetPasswordVar', Accounts._resetPasswordToken);
}

function showChangePwdError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = $('.' + parentElement)[0];
  const nextNode = $('.' + nextElement)[0];
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.resetpwd.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.resetpwd.helpers({
  resetPassword() {
    return Session.get('resetPasswordVar');
  }
});

Template.resetpwd.events({
  'keypress #newpasswordconfirm': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      $('#newpwdsubmitbutton').click();
    }
  },
  'keypress #loginemail': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      $('#forgotsubmitbutton').click();
    }
  },
  'click #forgotsubmitbutton': function (event, template) {
    $("#mailSentMessage").css("display", "none");
    email = $('#loginemail').val();
    $("#newPwdLoadingSpinner").css("display", "block");
    Accounts.forgotPassword({email: email}, function (e) {
      $("#newPwdLoadingSpinner").css("display", "none");
      if (e) {
        if (e.reason === 'User not found') {
          showChangePwdError("The email address that you've entered doesn't match any account.", 'formcontainer', 'inputcontainer');
          return false;
        } else if (e.reason === 'Internal server error') {
          showChangePwdError('Please check your internet connection.', 'formcontainer', 'inputcontainer');
          return false;
        } else {
          showChangePwdError('An unknown error occurred. Please try again.', 'formcontainer', 'inputcontainer');
          return false;
        }
      } else {
        $("#mailSentMessage").css("display", "block");
      }
    });
  },
  'click #newpwdsubmitbutton': function (event, template) {
    const newPass = $('#newpasswordbox').val();
    const newPassConfirm = $('#newpasswordconfirm').val();
    if (!$('#newpasswordbox')[0].checkValidity()) {
      showChangePwdError('Password must be between 6 and 30 characters', 'newpwdbox', 'newpwdform');
      return false;
    } else if (newPass !== newPassConfirm) {
      showChangePwdError('Passwords do not match', 'newpwdbox', 'newpwdform');
      return false;
    }
    Accounts.resetPassword(Session.get('resetPasswordVar'), newPass, function (e) {
      if (e) {
        if (e.reason === 'Token expired') {
          showChangePwdError('This link is expired.', 'newpwdbox', 'newpwdform');
          return false;
        } else if (e.reason === 'Internal server error') {
          showChangePwdError('Please check your internet connection.', 'newpwdbox', 'newpwdform');
          return false;
        } else {
          showChangePwdError('An unknown error occurred. Please try again.', 'newpwdbox', 'newpwdform');
          return false;
        }
      } else {
        $(".newpwdbox").css("display", "none");
        $("#pwdchangemessage").css("display", "block");
        setTimeout(() => {
          Session.set('resetPasswordVar', null);
          Router.go('/');
        }, 3000);
      }
    });
  },
  'click #navHome': function (event, template) {
    Router.go('/');
  },
});

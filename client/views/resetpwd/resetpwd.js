import $ from 'jquery';

Accounts.onResetPasswordLink((token, done) => {
  Router.go('resetpwd');
});

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
  },
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
    $('#mailSentMessage').css('display', 'none');
    const email = $('#loginemail').val();
    $('#newPwdLoadingSpinner').css('display', 'block');
    Accounts.forgotPassword({ email: email }, function (e) {
      $('#newPwdLoadingSpinner').css('display', 'none');
      if (e) {
        const errorMessage = [
          { reason: 'User not found', message: "The email address that you've entered doesn't match any account." },
          { reason: 'Internal server error', message: 'Please check your internet connection.' },
        ];
        const in1 = errorMessage.findIndex(x => x.reason === e.reason);
        if (in1 === -1) {
          showChangePwdError(e.reason, 'formcontainer', 'inputcontainer');
        } else {
          showChangePwdError(errorMessage[in1].message, 'formcontainer', 'inputcontainer');
        }
      } else {
        $('#mailSentMessage').css('display', 'block');
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
        const errorMessage = [
          { reason: 'Token expired', message: 'This link is expired.' },
          { reason: 'Internal server error', message: 'Please check your internet connection.' },
        ];
        const in1 = errorMessage.findIndex(x => x.reason === e.reason);
        if (in1 === -1) {
          showChangePwdError(e.reason, 'newpwdbox', 'newpwdform');
        } else {
          showChangePwdError(errorMessage[in1].message, 'newpwdbox', 'newpwdform');
        }
      } else {
        $('.newpwdbox').css('display', 'none');
        $('#pwdchangemessage').css('display', 'block');
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

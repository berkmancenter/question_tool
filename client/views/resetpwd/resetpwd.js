Accounts.onResetPasswordLink((token, done) => {
  setTimeout(()=>Router.go("resetpwd"), 0);
})

if (Accounts._resetPasswordToken) {
  Session.set('resetPasswordVar', Accounts._resetPasswordToken);
}

function showError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
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
  'click #forgotsubmitbutton': function (event, template) {
    email = document.getElementById('loginemail').value;
    Accounts.forgotPassword({email: email}, function (e) {
      if (e) {
        console.log("Error in forgot password: ", e.reason);
      } else {
        console.log("Success");
      }
    });
  },
  'click #newpwdsubmitbutton': function (event, template) {
    const newPass = document.getElementById('newpasswordbox').value;
    Accounts.resetPassword(Session.get('resetPasswordVar'), newPass, function (e) {
      if (e) {
        console.log("Error in changing password: ", e.reason);
      } else {
        console.log("Password changed.");
      }
    });
  },
});

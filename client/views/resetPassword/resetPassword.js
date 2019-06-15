function showError(reason, parentElement, nextElement) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.ResetPassword.events({
  'click #resetpasswordsubmitbutton': function(event, template) {
    event.preventDefault();
    var password = $("#resetPassword").val();
    var confirmPassword = $("#resetPasswordConfirm").val();
    if(password === confirmPassword && password.length > 6) {
      Accounts.resetPassword(Router.current().params.token, password, function(err){
        if(err) {
          console.log('Something went wrong');
          showError('Something went wrong', 'inputcontainer', 'resetPassword');
        } else {
          console.log('Password changed');
          window.location.href = '/';
        }
      })
    }
    return false;
  }
});

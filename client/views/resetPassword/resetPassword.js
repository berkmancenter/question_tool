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
    var password = $('#resetPassword').val(); // Get the new password
    var confirmPassword = $('#resetPasswordConfirm').val(); // Confirm the new password
    if (password !== confirmPassword){
       // If both passwords donot match
      showError('Passwords donot match', 'inputcontainer', 'resetPassword');
    }
    else if (password.length < 5) {
      // If length of password is less than 6
      showError('Password is not strong enough', 'inputcontainer', 'resetPassword');
    }
    else {
      // Update the password
      Accounts.resetPassword(Router.current().params.token, password, function(err){
        if (err) {
          // If some internal server error occurs
          console.log('Something went wrong');
          showError('Something went wrong', 'inputcontainer', 'resetPassword');
        } else {
          console.log('Password has been changed');
          window.location.href = '/';
        }
      });
    }
    return false;
  }
});

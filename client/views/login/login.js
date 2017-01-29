Template.login.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

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
        /* if(template.data) {
          window.location.href = "/" + template.data;
        } else {
          window.location.href = "/";
        }*/
        /* $(".formcontainer").fadeOut(400);
        $("#darker").fadeOut(400, function() {
          Blaze.remove(popoverTemplate);
        });*/
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
  'keypress #passwordbox': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which == 13) {
      event.preventDefault();
      document.getElementById('loginsubmitbutton').click();
    }
  },
});

function showError(reason, parentElement, nextElement) {
  if (typeof currentError != 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementsByClassName(parentElement)[0];
  const nextNode = document.getElementById(nextElement);
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

import { ReactiveVar } from 'meteor/reactive-var';

function showProposeError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementById('questiondiv');
  const nextNode = document.getElementById('questioninput');
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.propose.helpers({
  count() {
    return Template.instance().questionCount.get();
  },
});

Template.propose.onCreated(function () {
  this.questionCount = new ReactiveVar(0);
});

Template.propose.onRendered(() => {
  if (!Meteor.user()) {
    $('#anoncheck').show();
    $('#topinputcontainer').hide();
  } else {
    $('#topinputcontainer').hide();
  }
});

/* eslint-disable func-names, no-unused-vars */
Template.propose.events({
  'keypress #questionemailinput': function (event, template) {
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      $('#buttonarea').click();
    }
  },
  'click .checkbox': function (event, template) {
    // console.log(event);
    // return false;
    const checked = event.target.firstElementChild;
    if (checked.style.display === 'none' || !checked.style.display) {
      checked.style.display = 'block';
      if (event.target.id === 'savebox') {
        $('#bottominputcontainer').slideDown();
        $('#topinputcontainer').slideDown();
        document.getElementById('anoncheck').style.display = 'none';
      } else if (event.target.id === 'anonbox') {
        $('#topinputcontainer').slideUp();
        $('#questionnameinput').val('');
        $('#questionemailinput').val('');
      }
    } else {
      checked.style.display = 'none';
      if (event.target.id === 'savebox') {
        $('#bottominputcontainer').slideUp();
        $('#topinputcontainer').slideUp();
        document.getElementById('anoncheck').style.display = 'block';
      } else if (event.target.id === 'anonbox') {
        if (Meteor.user()) {
          $('#questionnameinput').val(Meteor.user().profile.name);
          $('#questionemailinput').val(Meteor.user().emails[0].address);
        } else {
          $('#topinputcontainer').slideDown();
          $('#questionnameinput').val('');
          $('#questionemailinput').val('');
        }
      }
    }
  },
  'click .checked': function (event, template) {
    // console.log(event);
    // return false;
    const checked = event.target;
    if (checked.style.display === 'none' || !checked.style.display) {
      if (event.target.id === 'savecheck') {
        $('#bottominputcontainer').slideDown();
        $('#topinputcontainer').slideDown();
        document.getElementById('anoncheck').style.display = 'none';
      } else if (event.target.id === 'anoncheck') {
        $('#topinputcontainer').slideUp();
        $('#questionnameinput').val('');
        $('#questionemailinput').val('');
      }
      checked.style.display = 'block';
    } else {
      if (event.target.id === 'savecheck') {
        $('#bottominputcontainer').slideUp();
        $('#topinputcontainer').slideUp();
        document.getElementById('anoncheck').style.display = 'block';
      } else if (event.target.id === 'anoncheck') {
        if (Meteor.user()) {
          $('#questionnameinput').val(Meteor.user().profile.name);
          $('#questionemailinput').val(Meteor.user().emails[0].address);
        } else {
          $('#topinputcontainer').slideDown();
          $('#questionnameinput').val('');
          $('#questionemailinput').val('');
        }
      }
      checked.style.display = 'none';
    }
  },
  'click #buttonarea': function (event, template) {
    // Retrieves data from the form
    let question = document.getElementById('questioninput').value;
    question = $('<p>').html(question).text();
    let email;
    let anonymous;
    const anonElement = document.getElementById('anoncheck');
    if (anonElement.style.display) {
      anonymous = (anonElement.style.display !== 'none');
    } else {
      anonymous = false;
    }
    let posterName = document.getElementById('questionnameinput').value;
    const posterEmail = document.getElementById('questionemailinput').value;
    let password1 = document.getElementById('questionpasswordinput');
    let password2 = document.getElementById('questionconfirminput');
    if (password1 && password2) {
      password1 = password1.value;
      password2 = password2.value;
    }
    if (template.data.anonymous) {
      if (anonymous) {
        posterName = 'Anonymous';
        email = '';
      } else if (!posterName && !posterEmail) {
        posterName = 'Anonymous';
        email = '';
      }
    } else if (!posterName || !posterEmail) {
      showProposeError('Admin has disabled anonymous posting. Please enter your name and email address.');
      return false;
    }
    // Checks whether the question input is blank
    if (!question) {
      showProposeError('Question cannot be left blank. Please try again.');
      return false;
    }
    // If the user entered a password, check the input
    if (password1 || password2) {
      const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      if (!posterEmail) {
        showProposeError('Please enter an email address.');
        return false;
      } else if (!posterName) {
        showProposeError('Please enter a name.');
        return false;
      } else if (!re.test(posterEmail)) {
        showProposeError('Enter a valid email address.');
        return false;
      } else if (posterName.length >= 30 || posterName.length <= 3) {
        showProposeError('Name must be between 3 and 30 characters.');
        return false;
      } else if (posterEmail.length >= 50 || posterEmail.length <= 7) {
        showProposeError('Email must be between 7 and 50 characters.');
        return false;
      } else if (password1 !== password2) {
        showProposeError('Passwords do not match.');
        return false;
      } else if (password2.length >= 30 || password2.length <= 6) {
        showProposeError('Password must be between 6 and 30 characters.');
        return false;
      }
      Meteor.call('register', posterEmail, password2, posterName, (error, result) => {
        if (typeof result === 'object') {
          const keys = {
            missingfield: 'Email, name, and password are required.',
            name: 'Name must be less than 30 characters.',
            systemname: 'Name cannot be "System" or "The System".',
            email: 'Enter a valid email between 7 & 50 characters.',
            password: 'Password must be between 6 & 30 characters.',
            exists: 'An account with that email already exists.',
            unknown: 'An unknown error occurred. Please try again.',
          };
          showProposeError(keys[result[0].name]);
          return false;
        }
        Meteor.loginWithPassword(posterEmail, password2, (e) => {
          if (e) {
            showProposeError(e);
            return false;
          }
        });
      });
    }
    const questionLength = template.data.max_question;
    Meteor.call('propose', template.data._id, question, anonymous, posterName, posterEmail, (e, r) => {
      // If returns an object, there was an error
      if (typeof r === 'object') {
        // Store an object of the error names and codes
        const errorCodes = {
          tablename: 'Table name is invalid. Please return to the list and try again.',
          text: 'Posts must be between 10 and ' + questionLength + ' characters.',
          poster: 'Please enter a valid name using less than 30 characters.',
          ip: 'There was an error with your IP address. Please try again.',
          timeorder: 'There was an error retrieving the current time. Please try again.',
          lasttouch: 'There was an error retrieving the current time. Please try again.',
          state: 'Question state is invalid. Please return to the list and try again.',
          votes: '# of votes is invalid. Please return to the list and try again.',
          email: 'Please enter a valid email address using less than 70 characters.',
          anonymous: 'Admin of this instance has disabled anonymous posting.',
        };
        // Alert the error message
        showProposeError(errorCodes[r[0].name]);
        return false;
      }
      // If successful, redirect back to the list page
      // Router.go("/list");
      if (typeof currentError !== 'undefined') {
        Blaze.remove(currentError);
      }
      $('#toparea').slideUp();
      $('#navAsk').click();
      // $("#navAsk").html("+ Ask");
      document.getElementById('navAsk').style.backgroundColor = '#27ae60';
      document.getElementById('questioninput').value = '';
      Blaze.remove(dropDownTemplate);
      // $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    });
  },
  'keyup #questioninput': function (event, template) {
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
    const found = event.target.value.match(urlRegex);
    let total = 0;
    if (found) {
      let totalURL = 0;
      for (let f = 0; f < found.length; f++) {
        totalURL += found[f].length;
      }
      total = (event.target.value.length - totalURL) + found.length;
      $('#questioninput').attr('maxlength', Number(template.data.max_question + totalURL - found.length));
    } else {
      total = event.target.value.length;
    }
    template.questionCount.set(total);
  },
});
/* eslint-enable func-names, no-unused-vars */

function showCreateError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
    document.getElementById('buttonarea').disabled = false;
  }
  const parentNode = document.getElementById('creatediv');
  const nextNode = document.getElementById('instancetopinputcontainer');
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.create.onRendered(() => {
  document.getElementById('allowanoncheck').style.display = 'block';
});

/* eslint-disable func-names, no-unused-vars */

Template.create.events({
  'click .checkbox': function (event, template) {
    // console.log(event);
    // return false;
    const checked = event.target.firstElementChild;
    if (checked.style.display === 'none' || !checked.style.display) {
      if (event.target.id === 'advancedbox') {
        $('#instancebottominputcontainer').css('display', 'flex').hide().slideDown();
      }
      checked.style.display = 'block';
    } else {
      checked.style.display = 'none';
      if (event.target.id === 'advancedbox') {
        $('#instancebottominputcontainer').slideUp();
      }
    }
  },
  'click .checked': function (event, template) {
    // console.log(event);
    // return false;
    const checked = event.target;
    if (checked.style.display === 'none' || !checked.style.display) {
      if (event.target.id === 'advancedcheck') {
        $('#instancebottominputcontainer').slideDown();
      }
      checked.style.display = 'block';
    } else {
      if (event.target.id === 'advancedcheck') {
        $('#instancebottominputcontainer').slideUp();
      }
      checked.style.display = 'none';
    }
  },
  'click .instancemodsplus': function (event, template) {
    const spacers = document.getElementsByClassName('emptyinputspacer');
    if (spacers.length < 4) {
      $('.instancemodsinput').removeClass('lastmodinput');
      $('.plusbuttoncontainer').removeClass('lastmodinput');
      $('.instancemodsplus').remove();
      $('<input class="instancemodsinput lastmodinput" type="text" placeholder="Moderator email..."><div class="emptyinputspacer lastinputspacer"><div class="plusbuttoncontainer"><div class="instancemodsplus">+</div></div></div>').insertAfter('.lastinputspacer').last();
      $('.lastinputspacer').first().removeClass('lastinputspacer');
      $('#instancebottominputcontainer').height((index, height) => (height + 50));
    } else {
      showCreateError("You've reached the maximum # of moderators (4).");
      return false;
    }
  },
  'click #buttonarea': function (event, template) {
    if (!Meteor.user()) {
      return false;
    }
    // document.getElementById("buttonarea").disabled = true;
    const anonElement = document.getElementById('allowanoncheck');
    let anonymous;
    if (anonElement.style.display) {
      anonymous = (anonElement.style.display !== 'none');
    } else {
      anonymous = false;
    }
    // Retrieve data from the form
    let tablename = document.getElementById('instancenameinput').value;
    // Ensures that the table name is capitalzied
    tablename = tablename.charAt(0).toUpperCase() + tablename.slice(1);

    const thresholdSelect = document.getElementsByName('threshold')[0];
    const threshold = thresholdSelect[thresholdSelect.selectedIndex].value;
    const lengthSelect = document.getElementsByName('new_length')[0];
    const redLength = lengthSelect[lengthSelect.selectedIndex].value;
    const staleSelect = document.getElementsByName('stale_length')[0];
    const stale = staleSelect[staleSelect.selectedIndex].value;
    const questionSelect = document.getElementsByName('max_question')[0];
    const maxQuestion = questionSelect[questionSelect.selectedIndex].value;
    const responseSelect = document.getElementsByName('max_response')[0];
    const maxResponse = responseSelect[responseSelect.selectedIndex].value;
    const hiddenSelector = document.getElementsByName('visibility')[0];
    const isHidden = (hiddenSelector[hiddenSelector.selectedIndex].value === 'hidden');
    let description = document.getElementById('instancedescriptioninput').value;

    // Ensures that the table description is capitalized
    description = description.charAt(0).toUpperCase() + description.slice(1);
    description = UniHTML.purify(description, { withoutTags: ['a', 'img', 'ol', 'ul', 'span', 'br', 'table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thread', 'tr', 'li'] });
    // If the passwords don't match, alert the user
    /* if(password !== passwordConfirm) {
      alert("Passwords do not match. Please try again.");
      return false;
    }*/
    const modsInput = document.getElementsByClassName('instancemodsinput');
    const mods = [];
    for (let m = 0; m < modsInput.length; m++) {
      if (modsInput[m].checkValidity()) {
        if (modsInput[m].value) {
          mods.push(modsInput[m].value.trim());
        }
      } else {
        showCreateError(modsInput[m].value + ' is not a valid email.');
        return false;
      }
    }
    // console.log(mods);
    // Calls the 'create' function on the server to add Instance to the DB
    Meteor.call('create', tablename, threshold, redLength, stale, description, mods, maxQuestion, maxResponse, anonymous, isHidden, (error, result) => {
      // If the result is an object, there was an error
      if (typeof result === 'object') {
        // Store an object of the error names and codes
        const errorCodes = {
          tablename: 'Please enter a valid instance name using only letters and numbers, no spaces.',
          threshold: "Please enter a valid # of 'featured' questions using the drop down menu.",
          new_length: "Please enter a valid value using the 'new questions' drop down menu.",
          stale_length: "Please enter a valid value using the 'old questions' drop down menu.",
          description: 'Please enter a valid description under 255 characters.',
          modlength: 'You have entered too many moderators. Please try again.',
        };
        // Alert the error
        showCreateError(errorCodes[result[0].name]);
        return false;
      }
      Blaze.remove(dropDownTemplate);
      $('#navCreate').html('+ Create');
      document.getElementById('navCreate').style.backgroundColor = '#27ae60';
      $('#toparea').slideUp();
    });
  },
  'keypress #instancedescriptioninput': function (event, template) {
    // eslint-disable-next-line no-param-reassign
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      document.getElementById('buttonarea').click();
    }
  },
  'keypress .instancemodsinput': function (event, template) {
    // eslint-disable-next-line no-param-reassign
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      let last = document.getElementsByClassName('lastinputspacer')[0];
      const lastPlus = last.children[0].children[0];
      lastPlus.click();
      last = document.getElementsByClassName('lastinputspacer')[0];
      last.previousSibling.focus();
    }
  },
});

/* eslint-enable func-names, no-unused-vars */


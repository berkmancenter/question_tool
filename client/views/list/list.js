import { Answers, Questions } from '/lib/common.js';

function present() {
  $('#nav-wrapper').slideUp();
  $('#mobile-nav').slideUp();
  $('.instancetitle').slideUp();
  $('.description').slideUp();
  $('#footer').slideUp();
  $('#presentationNav').fadeIn();
  $('.admincontainer').slideUp();
}

function unPresent() {
  $('#nav-wrapper').slideDown();
  $('#mobile-nav').slideDown();
  $('.instancetitle').slideDown();
  $('.description').slideDown();
  $('#footer').slideDown();
  $('#presentationNav').fadeOut();
}

// Helper function that calculates the average given an array
function average(data) {
  const sum = data.reduce((s, v) => (s + v), 0);
  const avg = sum / data.length;
  return avg;
}

function popupwindow(url, title, w, h) {
  const left = (screen.width / 2) - (w / 2);
  const top = (screen.height / 2) - (h / 2);
  return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

// Helper function that caluclates a standard deviation given an array
// Source: http://derickbailey.com/
function standardDeviation(values) {
  const avg = average(values);
  const squareDiffs = values.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });
  const avgSquareDiff = average(squareDiffs);
  const stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function enableDragging() {
  Meteor.call('adminCheck', Session.get('id'), (error, result) => {
    function dragMoveListener(event) {
      const target = event.target;
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      // Translates the question div to the current mouse position
      target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      // Sets the z-index to 99999 so the question div floats above others
      target.style.cssText += 'z-index:99999!important;';
      target.style.backgroundColor = '#e3e3e3';
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
    // If yes, enable draggable question divs
    if (result) {
      interact('.question')
      .ignoreFrom('textarea')
      .draggable({
        // Divs have inertia and continue moving when mouse is released
        inertia: true,
        restrict: {
          restriction: '#recent',
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 0, right: 0 },
        },
        onmove: dragMoveListener,
        onend(event) {
          // When the question div is dropped, return to original position
          event.target.style.cssText = '-webkit-transform: translate(0px, 0px);z-index:0!important;';
          event.target.setAttribute('data-x', 0);
          event.target.setAttribute('data-y', 0);
        },
      });

      // Sets options for drop interaction
      interact('.question').dropzone({
        // Active when one .quesiton div is dropped on another
        accept: '.question',
        // The two divs need over 75% overlapping for the drop to be registered
        overlap: 0.2,
        ondropactivate(event) { // eslint-disable-line no-unused-vars
        },
        ondragenter(event) {
          event.target.style.backgroundColor = '#e3e3e3';
        },
        ondragleave(event) {
          event.target.style.backgroundColor = 'white';
        },
        // When dropped on top of another div, redirect to the /combine page
        ondrop(event) {
          const id1 = event.relatedTarget.id;
          const id2 = event.target.id;
          const parentNode = document.getElementById('nav');
          Blaze.renderWithData(Template.combine, {
            first: id1,
            second: id2,
          }, parentNode);
          // window.location.href="/combine/" + id1 + "/" + id2;
        },
        ondropdeactivate(event) { // eslint-disable-line no-unused-vars
        },
      });
    }
  });
}

function showProposeError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementById('questiondiv');
  const nextNode = document.getElementById('questioninput');
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

function showReplyError(reason, id) {
  if (typeof replyError !== 'undefined') {
    Blaze.remove(replyError);
  }
  const parentNode = document.getElementById('down' + id);
  const nextNode = document.getElementById('text' + id);
  replyError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

function toggleButtonText(selector) {
  const oldText = $(selector).html();
  const toggleText = $(selector).attr('data-toggle-text');
  $(selector).attr('data-toggle-text', oldText);
  $(selector).html(toggleText);
}

function hasUpdates(questions, client) {
  if (questions.length !== client.length) return true;
  for (let i = 0; i < questions.length; i++) {
    if (client[i]._id !== questions[i]._id) {
      return true;
    }
  }
  return false;
}

Meteor.setInterval(() => {
  // Sets Session variable "timeval" to current time in ms every 2 seconds
  Session.set('timeval', new Date().getTime());
}, 1000);

Template.list.onCreated(function () {
  Session.set('responseName', '');
  Session.set('responseEmail', '');
  Session.set('timeval', new Date().getTime());
  Session.set('questionCount', 0);
  Session.set('replyCount', 0);
  Session.set('questionLimit', 250);
  Session.set('search', 'all');
  Session.set('tablename', Template.instance().data.tablename);
  Session.set('id', Template.instance().data._id);
  Session.set('slug', Template.instance().data.slug);
  Session.set('description', Template.instance().data.description);
  if (typeof Template.instance().data.anonymous !== 'undefined') {
    Session.set('anonymous', Template.instance().data.anonymous);
  } else {
    Session.set('anonymous', true);
  }
  Session.set('questionLength', Template.instance().data.max_question);
  Session.set('responseLength', Template.instance().data.max_response);
  const thresh = Template.instance().data.threshold ? Template.instance().data.threshold : Template.instance().data.threshhold;
  Session.set('threshold', thresh);
  // eslint-disable-next-line max-len
  if (Meteor.user() && (Template.instance().data.admin === Meteor.user().emails[0].address || Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) > -1)) {
    enableDragging();
  }
  Session.set('stale_length', Template.instance().data.stale_length);
  Session.set('new_length', Template.instance().data.new_length);
  this.visibleQuestions = new Mongo.Collection(null);
  this.visibleAnswers = new Mongo.Collection('visibleAnswers', { connection: null }); // need to implement this
  this.state = new ReactiveDict();

  this.getQuestions = () => {
    // eslint-disable-next-line max-len
    const adminMod = Meteor.user() && (Template.instance().data.admin === Meteor.user().emails[0].address || Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) > -1);
    const query = { instanceid: Session.get('id') };
    if (!adminMod) {
      query.state = 'normal';
    }
    return Questions.find(query);
  };

  this.getAnswers = () => (Answers.find({}));

  this.syncQuestions = (questions) => {
    this.visibleQuestions.remove({}); // Lazy hack to avoid having to check for question presence one by one
    questions.forEach(question => this.visibleQuestions.insert(question));
    this.state.set('hasChanges', false);
  };

  this.syncAnswers = (answers) => {
    this.visibleAnswers.remove({});
    answers.forEach(answer => this.visibleAnswers.insert(answer));
    this.state.set('hasChanges', false);
  };

  this.autorun((computation) => {
    // Grab the questions from the server. Need to define getQuestions as the questions we want.
    const adminMod = Meteor.user() && (Template.instance().data.admin === Meteor.user().emails[0].address || Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) > -1);
    const query = { instanceid: Session.get('id') };
    if (!adminMod) {
      query.state = 'normal';
    }
    const questions = Questions.find(query).fetch();
    const answers = Answers.find({ instanceid: Session.get('id') }).fetch();
    const client = Template.instance().visibleQuestions.find({ instanceid: Session.get('id') }).fetch();
    const updatedQs = hasUpdates(questions, client);
    // If Tracker re-runs there must have been changes to the questions so we now set the state to let the user know
    if (!computation.firstRun && this.state.get('presentMode') !== true && updatedQs) {
      this.state.set('hasChanges', true);
    } else if (!updatedQs && !computation.firstRun) {
      this.state.set('hasChanges', false);
    } else {
      this.syncQuestions(questions);
      this.syncAnswers(answers);
    }
  });

  // When the user requests it, we should sync the visible todos to
  // reflect the true state of the world
  this.onShowChanges = () => {
    this.syncQuestions(this.getQuestions());
    this.syncAnswers(this.getAnswers());
  };
});

Template.list.onRendered(() => {
  // Sets the document title when the template is rendered
  document.title = 'Live Question Answer Tool';
  $('#topinputcontainer').hide();
  $('head').append('<link rel="alternate" type="application/rss+xml" href="/rss/{{tablename}}"/>');
});

Template.list.helpers({
  // Sets the template tablename to the Session tablename variable
  tablename() {
    return Session.get('tablename');
  },
  // Sets the template id to the Session id variable
  id() {
    return Session.get('id');
  },
  // Sets the template description to the Session description variable
  description() {
    return Session.get('description');
  },
  // Sets the template admin boolean to the Session admin variable
  admin() {
    return Meteor.user() && Meteor.user().emails[0].address === this.admin;
  },
  moderator() {
    return Session.get('mod');
  },
  hasChanges() {
    return Template.instance().state.get('hasChanges');
  },
  // Retrieves, orders, and modifies the questions for the chosen table
  question() {
    let tableAdmin = false;
    let tableMod = false;
    let questions;
    if (Meteor.user()) {
      const userEmail = Meteor.user().emails[0].address;
      if (this.admin === userEmail) {
        tableAdmin = true;
      } else if (this.moderators.indexOf(userEmail) !== -1) {
        tableMod = true;
      }
    }
    // Finds the questions from the Questions DB
    if (Session.get('search') === 'all') {
      questions = Template.instance().visibleQuestions.find({
        instanceid: Session.get('id'),
      }).fetch();
    } else {
      const re = new RegExp(Session.get('search'), 'i');
      questions = Template.instance().visibleQuestions.find({
        instanceid: Session.get('id'),
        $or: [{
          text: {
            $regex: re,
          },
        }, {
          poster: {
            $regex: re,
          },
        }],
      }).fetch();
    }
    let maxVote = 0;
    const voteArray = [];
    // Finds the average # of votes and stores votes in an array
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].votes > maxVote) {
        maxVote = questions[i].votes;
      }
      voteArray.push(questions[i].votes);
    }
    // Sorts the questions depending on # of votes (descending)
    questions.sort((a, b) => {
      // console.log(((new Date().getTime() - a.lasttouch) / 60000).floor());
      if (a.votes > b.votes) {
        return -1;
      } else if (a.votes < b.votes) {
        return 1;
      }
      return 0;
    });
    // Loops through the retrieved questions and sets properties
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].state !== 'disabled' || tableMod || tableAdmin) {
        const urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
        questions[i].text = questions[i].text.replace(urlRegex, (url) => {
          let hasPeren = false;
          if (url.charAt(url.length - 1) === ')') {
            url = url.substring(0, url.length - 1);
            hasPeren = true;
          }
          let fullURL = url;
          if (url.indexOf('http://') === -1 || url.indexOf('https://') === -1) {
            fullURL = 'http://' + url;
          }
          if (!hasPeren) {
            return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
          }
          return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>)';
        });
        questions[i].adminButtons = (tableAdmin || tableMod);
        // Sets the answer and modify links
        questions[i].answerlink = '/answer/' + questions[i]._id;
        questions[i].modifylink = '/modify/' + questions[i]._id;
        const avg = (Math.max(...voteArray) + Math.min(...voteArray)) / 2;
        // Uses standard deviation to set the shade of the vote box
        const stddev = standardDeviation(voteArray) + 0.001;
        questions[i].shade = 'vc' + Math.round(3 + ((questions[i].votes - avg) / stddev));
        // Sets the age marker depending on how long since question last modified
        const staleDiff = (Session.get('timeval') - questions[i].lasttouch) / 1000;
        const newDiff = (Session.get('timeval') - questions[i].timeorder) / 1000;
        if (staleDiff > Session.get('stale_length')) {
          questions[i].stale = true;
          questions[i].age_marker = 'stale-question';
        } else if (newDiff < Session.get('new_length')) {
          questions[i].new = true;
          questions[i].age_marker = 'new-question';
        }
        // Finds the answers for the given question ID
        const answers = Template.instance().visibleAnswers.find({
          qid: questions[i]._id,
        }).fetch();
        if (answers.length > 0) {
          // if(answers.length > 3) {
          questions[i].hasHidden = true;
          questions[i].numberHidden = answers.length;
          if (answers.length === 1) {
            questions[i].replyText = 'reply';
          } else {
            questions[i].replyText = 'replies';
          }
          // }
          answers.reverse();
          questions[i].answer = answers;
          for (let a = 0; a < questions[i].answer.length; a++) {
            // if(a > 2) {
            questions[i].answer[a].isHidden = true;
            // }
            questions[i].answer[a].text = questions[i].answer[a].text.replace(/\B(@\S+)/g, '<strong>$1</strong>');
            questions[i].answer[a].text = questions[i].answer[a].text.replace(urlRegex, (url) => {
              let hasPeren = false;
              let fullURL = url;
              if (url.charAt(url.length - 1) === ')') {
                url = url.substring(0, url.length - 1);
                hasPeren = true;
              }
              if (url.indexOf('http://') === -1 || url.indexOf('https://') === -1) {
                fullURL = 'http://' + url;
              }
              if (!hasPeren) {
                return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
              }
              return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>)';
            });
          }
        }
        if (i < Session.get('threshold')) {
          questions[i].popular = true;
        } else {
          questions[i].popular = false;
        }
      }
    }
    questions.sort((a, b) => {
      // console.log(((new Date().getTime() - a.lasttouch) / 60000).floor());
      const aDiff = Math.floor(((new Date().getTime() - a.timeorder) / 60000));
      const bDiff = Math.floor(((new Date().getTime() - b.timeorder) / 60000));
      let aIndex = a.votes;
      let bIndex = b.votes;
      let aAnswerLength = 0;
      let bAnswerLength = 0;
      if (aDiff < 5) {
        aIndex += (maxVote * (5 - aDiff));
      }
      if (bDiff < 5) {
        bIndex += (maxVote * (5 - bDiff));
      }
      if (a.popular) {
        aIndex += 999999999;
      }
      if (b.popular) {
        bIndex += 999999999;
      }
      if (aIndex > bIndex) {
        return -1;
      } else if (aIndex < bIndex) {
        return 1;
      }
      if (a.answer) {
        aAnswerLength = a.answer.length;
      }
      if (b.answer) {
        bAnswerLength = b.answer.length;
      }
      if (aAnswerLength > bAnswerLength) {
        return -1;
      } else if (aAnswerLength < bAnswerLength) {
        return 1;
      }
      return 0;
    });
    // Return the questions object to be displayed in the template
    return questions;
  },
  responseName() {
    return Session.get('responseName');
  },
  responseEmail() {
    return Session.get('responseEmail');
  },
});

/* eslint-disable func-names, no-unused-vars */
Template.list.events({
  // When the vote button is clicked...
  'click .voteright': function (event, template) {
    Meteor.call('vote', event.currentTarget.id, Session.get('id'), (error, result) => {
      // If the result is an object, there was an error
      if (typeof result === 'object') {
        // Store an object of the error names and codes
        const errorCodes = {
          votedbefore: 'It appears that you have already voted up this question.',
          lasttouch: 'There was an error retrieving the time. Please return to the list and try again.',
          votes: 'There was an error incrementing the votes. Please return to the list and try again.',
          qid: 'There was an error with the question ID. Please return to the list and try again.',
          ip: 'There was an error with your IP address. Please return to the list and try again.',
          tablename: 'There was an error with the table name. Please return to the list and try again.',
        };
        // Alerts the error if one exists
        showProposeError(errorCodes[result[0].name]);
      }
    });
  },
  // When the admin hide button is clicked...
  'click .adminquestionhide': function (event, template) {
    // Call the server-side hide method to hide the question
    if (Questions.findOne({ _id: event.currentTarget.id }).state === 'disabled') {
      Meteor.call('unhideThis', event.currentTarget.id);
    } else {
      Meteor.call('hide', event.currentTarget.id);
    }
  },
  // When the admin unhide button is clicked...
  'click #unhidebutton': function (event, template) {
    // Call the server-side unhide method to unhide all questions
    Meteor.call('unhide', Session.get('id'));
  },
  'click #deletebutton': function (event, template) {
    const check = confirm('Are you sure you would like to delete the instance?');
    if (check) {
      Meteor.call('adminRemove', event.currentTarget.parentNode.dataset.tableId, (error, result) => {
        if (!error) {
          Router.go('/');
        }
      });
    }
  },
  'click #navAsk': function (event, template) {
    const parentNode = document.getElementById('nav-wrapper');
    dropDownTemplate = Blaze.render(Template.propose, parentNode);
    const questionDiv = document.getElementById('toparea');
    if (questionDiv.style.display === 'none' || !questionDiv.style.display) {
      toggleButtonText('#navAsk');
      document.getElementById('navAsk').style.backgroundColor = '#ec4f4f';
      $('#toparea').slideDown();
      $('#questioninput').focus();
    } else {
      if (typeof currentError !== 'undefined') {
        Blaze.remove(currentError);
      }
      toggleButtonText('#navAsk');
      document.getElementById('navAsk').style.backgroundColor = '#27ae60';
      $('#toparea').slideUp();
      if (typeof dropDownTemplate !== 'undefined') {
        Blaze.remove(dropDownTemplate);
      }
    }
  },
  'click .replybutton': function (event, template) {
    Session.set('replyCount', 0);
    $('.replybottom').slideUp();
    $('.replyarea').val('');
    $('.replybutton').html('Reply');
    const theID = event.target.id.substring(5);
    const theArea = document.getElementById('down' + theID);
    if (theArea.style.display === 'none' || !theArea.style.display) {
      document.getElementById('reply' + theID).innerHTML = 'Close';
      $('#down' + theID).slideDown(400, function () {
        $(this).css('display', 'block');
      });
      $('#text' + theID).focus();
    } else {
      if (typeof replyError !== 'undefined') {
        Blaze.remove(replyError);
      }
      document.getElementById('reply' + theID).innerHTML = 'Reply';
      $('#down' + theID).slideUp();
    }
  },
  'click .checkbox': function (event, template) {
    const checked = event.target.firstElementChild;
    if (checked.style.display === 'none' || !checked.style.display) {
      checked.style.display = 'block';
      if (Meteor.user()) {
        $('.replyname').val('Anonymous');
        $('.replyemail').val('');
      }
    }
  },
  'click .checked': function (event, template) {
    // console.log(event);
    // return false;
    const checked = event.target;
    if (checked.style.display === 'block') {
      if (Meteor.user()) {
        $('.replyname').val(Meteor.user().profile.name);
        $('.replyemail').val(Meteor.user().emails[0].address);
      }
      checked.style.display = 'none';
    }
  },
  'click .replybottombutton': function (event, template) {
    // Retrieves data from form
    const theID = event.target.id;
    // var anonymous = document.getElementById("anonbox").checked;
    const answer = document.getElementById('text' + theID).value;
    let posterName = Meteor.user().profile.name;
    const email = Meteor.user().emails[0].address;
    // Gets the user's IP address from the server
    Meteor.call('getIP', (error, result) => {
      if (!error) {
        // If a name isn't specified, call them "Anonymous"
        if (!posterName) {
          posterName = 'Anonymous';
        }
        // Calls a server-side method to answer a question and update DBs
        Meteor.call('answer', Session.get('id'), answer, posterName, email, result, theID, (e, r) => {
          // If the result is an object, there was an error
          if (typeof r === 'object') {
            // Store an object of the error names and codes
            const errorCodes = {
              text: 'Please enter an answer.',
              poster: 'Please enter a valid name.',
              email: 'Please enter a valid email address.',
              ip: 'There was an error with your IP address. Try again.',
              instanceid: 'There was an error with the instance id. Try again.',
              qid: 'There was an error with the question ID.',
            };
            // Alert the error
            showReplyError(errorCodes[r[0].name], theID);
            return false;
          }
          if (typeof replyError !== 'undefined') {
            Blaze.remove(replyError);
          }
          document.getElementById('reply' + theID).innerHTML = 'Reply';
          document.getElementById('text' + theID).value = '';
          $('#down' + theID).slideUp();
        });
      }
    });
  },

  'click .anon-reply-bottom-button': function (event, template) {
    // Retrieves data from form
    const theID = event.target.id;
    // var anonymous = document.getElementById("anonbox").checked;
    const answer = document.getElementById('text' + theID).value;
    let posterName = 'Anonymous';
    const email = '';
    if (!Session.get('anonymous')) {
      showReplyError('The admin has disabled anonymous posting.', theID);
      return false;
    }
    // Gets the user's IP address from the server
    Meteor.call('getIP', (error, result) => {
      if (!error) {
        // If a name isn't specified, call them "Anonymous"
        if (!posterName) {
          posterName = 'Anonymous';
        }
        // Calls a server-side method to answer a question and update DBs
        Meteor.call('answer', Session.get('id'), answer, posterName, email, result, theID, (e, r) => {
          // If the result is an object, there was an error
          if (typeof r === 'object') {
            // Store an object of the error names and codes
            const errorCodes = {
              text: 'Please enter an answer.',
              poster: 'Please enter a valid name.',
              email: 'Please enter a valid email address.',
              ip: 'There was an error with your IP address. Try again.',
              instanceid: 'There was an error with the instance id. Try again.',
              qid: 'There was an error with the question ID.',
            };
            // Alert the error
            showReplyError(errorCodes[r[0].name], theID);
            return false;
          }
          if (typeof replyError !== 'undefined') {
            Blaze.remove(replyError);
          }
          document.getElementById('reply' + theID).innerHTML = 'Reply';
          document.getElementById('text' + theID).value = '';
          $('#down' + theID).slideUp();
        });
      }
    });
  },
  'keypress .replyemail': function (event, template) {
    // eslint-disable-next-line no-param-reassign
    event.which = event.which || event.keyCode;
    if (event.which === 13) {
      event.preventDefault();
      const theID = event.target.id.substring(5);
      const buttons = document.getElementsByClassName('replybottombutton');
      for (let b = 0; b < buttons.length; b++) {
        if (buttons[b].id === theID) {
          buttons[b].click();
        }
      }
    }
  },
  'keyup .replyname': function (event, template) {
    Session.set('responseName', event.target.value);
  },
  'keyup .replyemail': function (event, template) {
    Session.set('responseEmail', event.target.value);
  },
  'keyup #searchbar': function (event, template) {
    if (event.target.value) {
      Session.set('search', event.target.value);
    } else {
      Session.set('search', 'all');
    }
    // return Users.find({name: {$regex: re}});
  },
  'keyup .replyarea': function (event, template) {
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
    const found = event.target.value.match(urlRegex);
    let total = 0;
    if (found) {
      let totalURL = 0;
      for (let f = 0; f < found.length; f++) {
        totalURL += found[f].length;
      }
      total = (event.target.value.length - totalURL) + found.length;
      $(event.target).attr('maxlength', Number(Session.get('responseLength') + totalURL - found.length));
    } else {
      total = event.target.value.length;
    }
    Session.set('replyCount', total);
  },
  'click .facebookbutton': function (event, template) {
    popupwindow('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.origin + '/list/' + Session.get('slug')), 'Share Question Tool!', 600, 400);
  },
  'click .twitterbutton': function (event, template) {
    const questionDiv = event.target.parentElement.parentElement.parentElement;
    let questionText = questionDiv.getElementsByClassName('questiontext')[0].innerHTML.trim();
    if (questionText.length > 35) {
      questionText = questionText.substring(0, 34);
    }
    const tweetText = 'Check out this question: "' + questionText + '..." on Question Tool by @berkmancenter ' + window.location.origin + '/list/' + Session.get('slug');
    popupwindow('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText), 'Share Question Tool!', 600, 400);
  },
  'click #modbutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.render(Template.add, parentNode);
  },
  'click #renamebutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    const table = Template.instance().data;
    popoverTemplate = Blaze.renderWithData(Template.rename, {
      table,
      isList: true,
    }, parentNode);
  },
  'click .adminquestionmodify': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.renderWithData(Template.modify, event.currentTarget.id, parentNode);
  },
  'click #navPresent': function (event, template) {
    present();
    Template.instance().state.set('presentMode', true);
    $(document).on('keydown', (e) => {
      if (e.keyCode === 27) {
        unPresent();
        $(document).off('keydown');
        Template.instance().state.set('presentMode', false);
      }
    });
  },
  'click #navUnPresent': function (event, template) {
    unPresent();
    Template.instance().state.set('presentMode', true);
  },
  'click .hiddenMessage': function (event, template) {
    const parentNode = document.getElementById('main-wrapper');
    popoverTemplate = Blaze.renderWithData(Template.answers, event.currentTarget.id, parentNode);

    // $(event.currentTarget).prev().slideDown();
    // event.currentTarget.style.display = "none";
    // $(event.currentTarget).next().css("display", "block");
    /* var replyText = "replies";
    if(event.target.id === 1) {
      replyText = "reply";
    }
    $(event.currentTarget).html("Hide " + replyText + "...");
    $(event.currentTarget).attr('class', 'hiddenMessageHide');
    Tracker.flush();*/
  },
  'click .hiddenMessageHide': function (event, template) {
    $(event.currentTarget).prev().prev().slideUp();
    event.currentTarget.style.display = 'none';
    $(event.currentTarget).prev().css('display', 'block');
    /* var numberHidden = event.currentTarget.id;
    var replyText = "replies";
    if(numberHidden === 1) {
      replyText = "reply";
    }
    $(event.currentTarget).html("Show " + numberHidden + " {{numberHidden}} more " + replyText + "...");
    $(event.currentTarget).attr('class', 'hiddenMessage');
    Tracker.flush();*/
  },
  'click .new-posts': function (event, template) {
    Template.instance().onShowChanges();
  },
});
/* eslint-enable func-names, no-unused-vars */

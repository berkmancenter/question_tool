import { Answers, Questions, Instances } from '/lib/common.js';

let isPresenting = false;

function present() {
  $('#nav-wrapper').slideUp();
  $('#mobile-nav').slideUp();
  $('.instancetitle').slideUp();
  $('.description').slideUp();
  $('#footer').slideUp();
  $('#presentationNav').fadeIn();
  $('.admincontainer').slideUp();
  isPresenting = true;
}

function unPresent() {
  $('#nav-wrapper').slideDown();
  $('#mobile-nav').slideDown();
  $('.instancetitle').slideDown();
  $('.description').slideDown();
  $('#footer').slideDown();
  $('#presentationNav').fadeOut();
  isPresenting = false;
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

function enableDragging(id) {
  Meteor.call('adminCheck', id, (error, result) => {
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
      interact('.question-' + id)
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
      interact('.question-' + id).dropzone({
        // Active when one .quesiton div is dropped on another
        accept: '.question-' + id,
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
            instanceid: id,
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

function showListError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementById('list-wrapper');
  const nextNode = document.getElementById('quest-container');
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
  this.seconds = new ReactiveVar(0);
  Session.set('timeval', new Date().getTime());
  Session.set('search', 'all');
  const adminMod = Meteor.user() && (Template.instance().data.admin === Meteor.user().emails[0].address || Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) > -1);
  // eslint-disable-next-line max-len
  if (adminMod) {
    enableDragging(Template.instance().data._id);
  }
  this.visibleQuestions = new Mongo.Collection(null);
  this.visibleAnswers = new Mongo.Collection('visibleAnswers', { connection: null }); // need to implement this
  this.state = new ReactiveDict();

  const template = this;
  this.getQuestions = () => {
    // eslint-disable-next-line max-len
    const query = { instanceid: template.data._id };
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

  this.updateInPlace = (questions) => {
    questions.forEach(question => 
      this.visibleQuestions.update({ _id: question._id }, { $set: { state: question.state } })
    );
  };


  this.autorun((computation) => {
    if (!this.subscriptionsReady()) { return; }
    // Grab the questions from the server. Need to define getQuestions as the questions we want.
    const query = { instanceid: template.data._id };
    if (!adminMod) {
      query.state = 'normal';
    }
    const questions = Questions.find(query).fetch();
    const hiddenQs = Questions.find({ instanceid: template.data._id, state: 'disabled' }).count();
    const answers = Answers.find({ instanceid: template.data._id }).fetch();
    const client = Template.instance().visibleQuestions.find({ instanceid: template.data._id }).fetch();
    const clientHidden = Template.instance().visibleQuestions.find({ instanceid: template.data._id,
      state: 'disabled' }).count();
    const updatedQs = hasUpdates(questions, client);
    const hiddenUpdate = hiddenQs !== clientHidden;
    if (hiddenUpdate && adminMod) {
      this.updateInPlace(questions);
    }
    // If Tracker re-runs there must have been changes to the questions so we now set the state to let the user know
    if (!computation.firstRun && this.state.get('presentMode') !== true && updatedQs) {
      this.state.set('hasChanges', true);
      if(!this.countdown){
        this.countdown = Meteor.setTimeout(() => { this.onShowChanges(true); }, 5000);
        this.seconds.set(5);
        this.secondsInterval = Meteor.setInterval(() => { this.seconds.set(this.seconds.get() - 1); }, 1000);
      }
    } else if (!updatedQs && !computation.firstRun) {
      this.state.set('hasChanges', false);
    } else {
      this.syncQuestions(questions);
      this.syncAnswers(answers);
    }
  });

  // When the user requests it, we should sync the visible todos to
  // reflect the true state of the world
  this.onShowChanges = (auto) => {
    this.seconds.set(0);
    this.countdown = null;
    Meteor.clearInterval(this.secondsInterval);
    if (auto && this.state.get('typing')) { return false; }
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
  // Sets the template admin boolean to the Session admin variable
  admin() {
    return Meteor.user() && Meteor.user().emails[0].address === Template.instance().data.admin;
  },
  moderator() {
    return Meteor.user() && Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) !== -1;
  },
  hasChanges() {
    return Template.instance().state.get('hasChanges');
  },
  visible() {
    if (this.state !== 'disabled') return true;

    if (isPresenting === true) return false;
    
    let tableAdmin = false;
    let tableMod = false;
    let instance = Instances.findOne({ _id: this.instanceid });

    if (Meteor.user()) {
      const userEmail = Meteor.user().emails[0].address;
      if (instance.admin === userEmail) {
        tableAdmin = true;
      } else if (instance.moderators.indexOf(userEmail) !== -1) {
        tableMod = true;
      }
    }

    return tableAdmin || tableMod;
  },
  hasSeconds() {
    return Template.instance().seconds.get() > 0 && !Template.instance().state.get('typing');
  },
  seconds() {
    return Template.instance().seconds.get();
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
        instanceid: Template.instance().data._id,
      }).fetch();
    } else {
      const re = new RegExp(Session.get('search'), 'i');
      questions = Template.instance().visibleQuestions.find({
        instanceid: Template.instance().data._id,
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
        if (staleDiff > this.stale_length) {
          questions[i].stale = true;
          questions[i].age_marker = 'stale-question';
        } else if (newDiff < this.new_length) {
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
        const thresh = this.threshold ? this.threshold : this.threshhold;
        if (i < thresh) {
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
      if (a.state == 'disabled' && b.state != 'disabled') {
        return 1;
      } else if (a.state != 'disabled' && b.state == 'disabled') {
        return -1;
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
});

/* eslint-disable func-names, no-unused-vars */
Template.list.events({
  // When the vote button is clicked...
  'click .voteright': function (event, template) {
    Meteor.call('vote', event.currentTarget.id, (error, result) => {
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
        showListError(errorCodes[result[0].name]);
      }
    });
  },
  // When the admin hide button is clicked...
  'click .adminquestionhide': function (event, template) {
    // Call the server-side hide method to hide the question
    if (Questions.findOne({ _id: event.currentTarget.id }).state === 'disabled') {
      Meteor.call('unhideThis', event.currentTarget.id);
    } else {
      Meteor.call('hideThis', event.currentTarget.id);
    }
  },
  // When the admin unhide button is clicked...
  'click #unhidebutton': function (event, template) {
    // Call the server-side unhide method to unhide all questions
    Meteor.call('unhide', template.data._id);
  },
  'click #deletebutton': function (event, template) {
    popoverTemplate = Blaze.renderWithData(Template.delete, Instances.findOne({ _id: $(event.target.parentElement).data('tableId') }), document.getElementById('nav'));
  },
  'click #navAsk': function (event, template) {
    const parentNode = document.getElementById('nav-wrapper');
    dropDownTemplate = Blaze.renderWithData(Template.propose, template.data, parentNode);
    const questionDiv = document.getElementById('toparea');
    if (questionDiv.style.display === 'none' || !questionDiv.style.display) {
      toggleButtonText('#navAsk');
      document.getElementById('navAsk').style.backgroundColor = '#ec4f4f';
      $('#toparea').slideDown();
      $('#questioninput').focus();
      Template.instance().state.set('typing', true);
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
      Template.instance().state.set('typing', false);
    }
  },
  'click .checkbox': function (event, template) {
    const checked = event.target.firstElementChild;
    if (checked.style.display === 'none' || !checked.style.display) {
      checked.style.display = 'block';
    }
  },
  'click .checked': function (event, template) {
    const checked = event.target;
    if (checked.style.display === 'block') {
      checked.style.display = 'none';
    }
  },
  'click .replybottombutton': function (event, template) {
    // Retrieves data from form
    const theID = event.target.id;
    const anon = false;
    const answer = document.getElementById('text' + theID).value;

    // Calls a server-side method to answer a question and update DBs
    Meteor.call('answer', template.data._id, answer, theID, anon, (e, r) => {
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
          anonymous: 'The admin has disabled anonymous posting.',
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
  },

  'click .anon-reply-bottom-button': function (event, template) {
    // Retrieves data from form
    const theID = event.target.id;
    // var anonymous = document.getElementById("anonbox").checked;
    const answer = document.getElementById('text' + theID).value;

    const anon = true;
    // Calls a server-side method to answer a question and update DBs
    Meteor.call('answer', template.data._id, answer, theID, anon, (e, r) => {
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
          anonymous: 'The admin has disabled anonymous posting.',
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
  'keyup #searchbar': function (event, template) {
    if (event.target.value) {
      Session.set('search', event.target.value);
    } else {
      Session.set('search', 'all');
    }
    // return Users.find({name: {$regex: re}});
  },
  'click .facebookbutton': function (event, template) {
    popupwindow('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.origin + '/list/' + template.data.slug), 'Share Question Tool!', 600, 400);
  },
  'click .twitterbutton': function (event, template) {
    const questionDiv = event.target.parentElement.parentElement.parentElement;
    let questionText = questionDiv.getElementsByClassName('questiontext')[0].innerHTML.trim();
    if (questionText.length > 35) {
      questionText = questionText.substring(0, 34);
    }
    const tweetText = 'Check out this question: "' + questionText + '..." on Question Tool by @berkmancenter ' + window.location.origin + '/list/' + template.data.slug;
    popupwindow('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweetText), 'Share Question Tool!', 600, 400);
  },
  'click #modbutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.renderWithData(Template.add, template.data, parentNode);
  },
  'click #renamebutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    const table = Template.instance().data;
    popoverTemplate = Blaze.renderWithData(Template.rename, {
      table,
      isList: true,
    }, parentNode);
  },
  'click #editadvbutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    const table = Template.instance().data;
    popoverTemplate = Blaze.renderWithData(Template.edit, {
      table,
      isList: true,
    }, parentNode);
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
  'click .new-posts': function (event, template) {
    Template.instance().onShowChanges();
  },
  'focus .replyarea': function(event, template) {
    Template.instance().state.set('typing', true);
  },
  'blur .replyarea': function(event, template) {
    Template.instance().state.set('typing', false);
  },
});
/* eslint-enable func-names, no-unused-vars */

import { Votes, Answers, Instances, Questions } from '/lib/common.js';

Template.question_div.onCreated(function () {
  this.replyCount = new ReactiveVar(0);
});

Template.question_div.helpers({
  isPoster() {
    return Meteor.user() && Meteor.user().emails[0].address === this.email && this.posterLoggedIn;
  },

  replyCount() {
    return Template.instance().replyCount.get();
  },

  responseLength() {
    return Instances.findOne({ _id: this.instanceid }).max_response;
  },

  isDisabled() {
    if (Questions.findOne({ _id: this._id }).state == 'disabled') {
      return true;
    }
    return false;
  },

  isSocial() {
    return Instances.findOne({ _id: this.instanceid }).social;
  },

  hasAnswers() {
    const answers = Answers.find({
      qid: this._id,
    });
    return answers.fetch().length > 0;
  },

  answersCount() {
    const count = Answers.find({ qid: this._id }).fetch().length;
    const base = 'repl';
    const add = count > 1 ? 'ies' : 'y';
    return count + ' ' + base + add;
  },

  voteCount() {
    return Votes.find({ qid: this._id }).fetch().length;
  },

  date_format(timeorder) {
    return moment(timeorder).format('LLL');
  },

  time_format(timeorder) {
    return moment(timeorder).fromNow();
  },
});

Template.question_div.events({
  'click .replybutton': function (event, template) {
    template.replyCount.set(0);
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
      $(event.target).attr('maxlength', Number(Instances.findOne({ _id: template.data.instanceid }).max_response + totalURL - found.length));
    } else {
      total = event.target.value.length;
    }
    template.replyCount.set(total);
  },
  'click .showreplies': function (event, template) {
    const parentNode = document.getElementById('main-wrapper');
    popoverTemplate = Blaze.renderWithData(Template.answers, template.data._id, parentNode);
  },
  'click .adminquestionmodify': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.renderWithData(Template.modify, template.data._id, parentNode);
  },
});

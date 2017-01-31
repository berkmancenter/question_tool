import { Questions, Votes, Answers } from '/lib/common.js';

Template.question_div.helpers({
  isPoster() {
    const quest = Questions.findOne({ _id: this._id });
    return Meteor.user() && Meteor.user().emails[0].address === quest.email && quest.posterLoggedIn;
  },

  replyCount() {
    return Session.get('replyCount');
  },

  responseLength() {
    if (Session.get('responseLength')) {
      return Session.get('responseLength');
    }
    return 150;
  },

  isDisabled() {
    if (Questions.findOne({ _id: this._id }).state === 'disabled') {
      return true;
    }
    return false;
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

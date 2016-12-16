Template.question_div.helpers({
	replyCount: function() {
		return Session.get("replyCount");
	},
	responseLength: function() {
		if(Session.get("responseLength")) {
			return Session.get("responseLength");
		} else {
			return 150;
		}
	},

  isDisabled: function() {
		if(Questions.findOne({ _id: this._id}).state === "disabled") {
			return true;
		}
		return false;
	},

  hasAnswers: function () {
    var answers = Answers.find({
      qid: this._id
    })
    return answers.fetch().length > 0
  },

  answersCount: function () {
  	var count = Answers.find({ qid: this._id }).fetch().length;
  	var base = 'repl';
  	var add = count > 1 ? 'ies' : 'y';
  	return count + ' ' + base + add;
  },

  voteCount: function () {
  	return Votes.find({ qid: this._id }).fetch().length;
  }
});

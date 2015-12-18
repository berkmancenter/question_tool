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
	}
});
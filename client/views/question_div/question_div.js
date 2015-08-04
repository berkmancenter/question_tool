Template.question_div.helpers({
	replyCount: function() {
		return Session.get("replyCount");
	},
	responseLength: function() {
		return Session.get("responseLength");
	}
})
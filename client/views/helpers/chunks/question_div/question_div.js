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
})
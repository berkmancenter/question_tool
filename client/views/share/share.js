Template.share.onRendered(function() {
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.share.helpers({
	shareLink: function() {
		return "http://cyber.law.harvard.edu/questions/" + Session.get("tablename");
	}
});
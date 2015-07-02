Template.userInfo.events({
	"click #navLogout": function(event, template) {
		Meteor.logout();
	},
	"click #navLogin": function(event, template) {
		var URL = window.location.href;
		var split = URL.split("/");
		var page = split[split.length-1];
		window.location.href = "/newlogin/" + page;
	},
	"click #navRegister": function(event, template) {
		window.location.href = "/register";
	}
});

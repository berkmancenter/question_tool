Template.userInfo.events({
	"click #navLogout": function(event, template) {
		Meteor.logout();
		window.location.reload();
	},
	"click #navLogin": function(event, template) {
		var URL = window.location.href;
		var split = URL.split("/");
		var page = split[split.length-1];
		Router.go('/login/' + page);
	},
	"click #navRegister": function(event, template) {
		Router.go('/register');
	}
});

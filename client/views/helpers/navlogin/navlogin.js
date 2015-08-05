Template.userInfo.events({
	"click #navLogout": function(event, template) {
		Meteor.logout();
		//Tracker.flush();
		window.location.reload();
	},
	"click #navLogin": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.login, parentNode);
	},
	"click #navShare": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.share, parentNode);
	},
	"click #navRegister": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.register, parentNode);
	},
	"click #navHome": function(event, template) {
	 	document.getElementById("searchbar").value = "";
		Session.set("search", "");
		Router.go("/");
	},
	"click #darker": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
	}
});

function showError(reason, parentElement, nextElement) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementsByClassName(parentElement)[0];
	var nextNode = document.getElementById(nextElement);
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

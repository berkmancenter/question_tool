Template.newlogin.onRendered(function() {
	document.title = "Question Tool Login";
});

Template.newlogin.events({
	"click #submitbutton": function(event, template) {
		var email = document.getElementById("loginemail").value;
		var password = document.getElementById("passwordbox").value;
		if(!email) {
			alert("Please enter a valid email address.");
			return false;
		} else if(!password) {
			alert("Please enter a valid password.");
			return false;
		}
		Meteor.loginWithPassword(email, password, function(error) {
			if(!error) {
				if(template.data) {
					window.location.href = "/" + template.data;
				} else {
					window.location.href = "/";
				}
			} else {
				alert(error);
			}
		})
	},
	"keypress #passwordbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	},
	"click #returnbutton": function(event, template) {
		if(template.data) {
			Router.go('/' + template.data);
			//window.location.href = "/" + template.data;
		} else {
			Router.go('/');
		}
	}
});
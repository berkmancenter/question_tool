Template.newlogin.events({
	"click #submitbutton": function() {
		var email = document.getElementById("loginemail").value;
		var password = document.getElementById("passwordbox").value;
		Meteor.loginWithPassword(email, password, function(error) {
			if(!error) {
				window.location.href = "/list";
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
	}
})
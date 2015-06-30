Template.register.events({
	"click #submitbutton": function() {
		var email = document.getElementById("loginemail").value;
		var loginName = document.getElementById("loginname").value;
		var password1 = document.getElementById("passwordbox").value;
		var password2 = document.getElementById("passwordconfirm").value;
		if(!email) {
			alert("The email field cannot be left blank. Please try again.");
			return false;
		} else if (!loginName) {
			alert("The name field cannot be left blank. Please try again.");
			return false;
		} else if (password1 != password2) {
			alert("Passwords do not match. Please try again.");
			return false;
		}
		Accounts.createUser({
			email: email,
			password: password2,
			profile: {
				name: loginName
			}
		}, function(error) {
			if(error) {
				alert(error);
				return false;
			} else {
				window.location.href = "/";
			}
		})
	},
	"keypress #passwordconfirm": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});

Template.register.onRendered(function() {
	document.title = "Question Tool Registration";
});

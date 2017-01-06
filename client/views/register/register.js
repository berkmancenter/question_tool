Template.register.onRendered(function() {
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.register.events({
	"keypress #passwordconfirm": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("registersubmitbutton").click();
		}
	},
	"click #registersubmitbutton": function(event, template) {
    console.log(Meteor.status())
    Meteor.reconnect();
    console.log(Meteor.status())
		var email = document.getElementById("loginemail").value;
		var loginName = document.getElementById("loginname").value;
		var password1 = document.getElementById("passwordbox").value;
		var password2 = document.getElementById("passwordconfirm").value;
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		if(!email) {
			showError("Please enter an email address.", "inputcontainer", "loginemail");
			return false;
		} else if (!loginName) {
			showError("Please enter a name.", "inputcontainer", "loginemail");
			return false;
		} else if(!re.test(email)) {
			showError("Enter a valid email address.", "inputcontainer", "loginemail");
			return false;
		} else if(loginName.length >= 30 || loginName.length <= 3) {
			showError("Name must be between 3 and 30 characters.", "inputcontainer", "loginemail");
			return false;
		} else if(email.length >= 50 || email.length <= 7) {
			showError("Email must be between 7 and 50 characters.", "inputcontainer", "loginemail");
			return false;
		} else if (password1 !== password2) {
			showError("Passwords do not match.", "inputcontainer", "loginemail");
			return false;
		} else if(password2.length >= 30 || password2.length <= 6) {
			showError("Password must be between 6 and 30 characters.", "inputcontainer", "loginemail");
			return false;
		} else {
			Meteor.call('register', email, password2, loginName, function(error, result) {
				if(result === 3) {
					showError("Account with email already exists.", "inputcontainer", "loginemail");
					return false;
				} else if(result == 4) {
					showError("Enter a name using less than 30 characters.", "inputcontainer", "loginemail");
					return false;
				} else if(result == 5) {
					showError("Email must be between 7 and 50 characters.", "inputcontainer", "loginemail");
					return false;
				} else if(result == 1) {
					showError("Enter a name and email address.", "inputcontainer", "loginemail");
					return false;
				} else if(result == 2) {
					showError("Enter a valid email address.", "inputcontainer", "loginemail");
					return false;
				} else if(result == 6) {
					showError("Password must be between 6 and 30 characters.", "inputcontainer", "loginemail");
					return false;
				} else {
					Meteor.loginWithPassword(email, password2, function(error) {
						if(!error) {
							$(".formcontainer").fadeOut(400);
							$("#darker").fadeOut(400, function() {
								Blaze.remove(popoverTemplate);
							});
						}
					});
				}
			});
		}
	},
	"click #loginemphasis": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
			window.setTimeout(function() {
				var parentNode = document.getElementById("nav");
				popoverTemplate = Blaze.render(Template.login, parentNode);
			}, 10);
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

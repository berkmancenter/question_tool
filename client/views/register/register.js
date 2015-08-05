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
		var email = document.getElementById("loginemail").value;
		var loginName = document.getElementById("loginname").value;
		var password1 = document.getElementById("passwordbox").value;
		var password2 = document.getElementById("passwordconfirm").value;
		if(!email) {
			showError("Please enter an email address.", "inputcontainer", "loginemail");
			return false;
		} else if (!loginName) {
			showError("Please enter a name.", "inputcontainer", "loginemail");
			return false;
		} else if (password1 != password2) {
			showError("Passwords do not match.", "inputcontainer", "loginemail");
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
				showError(error.reason, "inputcontainer", "loginemail");
			} else {
				$(".formcontainer").fadeOut(400);
				$("#darker").fadeOut(400, function() {
					Blaze.remove(popoverTemplate);
				});
			}
		})
	},
	"click #loginemphasis": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
			window.setTimeout(function() {
				var parentNode = document.getElementById("banner");
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
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
		Session.set("search", "all");
		Router.go("/");
	},
	"click #darker": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
	},
	"click #loginsubmitbutton": function(event, template) {
		var email = document.getElementById("loginemail").value;
		var password = document.getElementById("passwordbox").value;
		if(!email) {
			showError("Please enter a valid email address.", "inputcontainer", "loginemail");
			return false;
		} else if(!password) {
			showError("Please enter a valid password.", "inputcontainer", "loginemail");
			return false;
		}
		Meteor.loginWithPassword(email, password, function(error) {
			if(!error) {
				/*if(template.data) {
					window.location.href = "/" + template.data;
				} else {
					window.location.href = "/";
				}*/
				/*$(".formcontainer").fadeOut(400);
				$("#darker").fadeOut(400, function() {
					Blaze.remove(popoverTemplate);
				});*/
				window.location.reload();
			} else {
				showError(error.reason, "inputcontainer", "loginemail");
			}
		})
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
	"click #shareclosebutton": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
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
	},
	"click #registeremphasis": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
			window.setTimeout(function() {
				var parentNode = document.getElementById("banner");
				popoverTemplate = Blaze.render(Template.register, parentNode);
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

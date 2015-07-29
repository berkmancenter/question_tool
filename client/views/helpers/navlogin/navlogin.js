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
			alert("Please enter a valid email address.");
			return false;
		} else if(!password) {
			alert("Please enter a valid password.");
			return false;
		}
		Meteor.loginWithPassword(email, password, function(error) {
			if(!error) {
				/*if(template.data) {
					window.location.href = "/" + template.data;
				} else {
					window.location.href = "/";
				}*/
				$(".formcontainer").fadeOut(400);
				$("#darker").fadeOut(400, function() {
					Blaze.remove(popoverTemplate);
				});
			} else {
				alert(error);
			}
		})
	},
	"click #registersubmitbutton": function(event, template) {
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

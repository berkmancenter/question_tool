Template.propose.helpers({
	questionLength: function() {
		if(Session.get("questionLength")) {
			return Session.get("questionLength");
		} else {
			return 350;
		}
	},
	anonymous: function() {
		return Session.get("anonymous");
	},
	count: function() {
		return Session.get("questionCount");
	}
});

Template.propose.onRendered(function() {
	if(!Meteor.user()) {
		$('#anoncheck').show();
		$('#topinputcontainer').hide();
	} else {
		$('#topinputcontainer').hide();
	}
});

Template.propose.events({
	"keypress #questionemailinput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			$("#buttonarea").click();
		}
	},
	"click .checkbox": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target.firstElementChild;
		if(checked.style.display == "none" || !checked.style.display) {
			checked.style.display = "block";
			if(event.target.id == "savebox") {
				$("#bottominputcontainer").slideDown();
				$('#topinputcontainer').slideDown();
				document.getElementById("anoncheck").style.display = "none";
			} else if(event.target.id == "anonbox") {
				$('#topinputcontainer').slideUp();
				$("#questionnameinput").val('');
				$("#questionemailinput").val('');
			}
		} else {
			checked.style.display = "none";
			if(event.target.id == "savebox") {
				$("#bottominputcontainer").slideUp();
				$('#topinputcontainer').slideUp();
				document.getElementById("anoncheck").style.display = "block";
			} else if(event.target.id == "anonbox") {
				if(Meteor.user()) {
					$("#questionnameinput").val(Meteor.user().profile.name);
					$("#questionemailinput").val(Meteor.user().emails[0].address);
				} else {
					$('#topinputcontainer').slideDown();
					$("#questionnameinput").val("");
					$("#questionemailinput").val("");
				}
			}
		}
	},
	"click .checked": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "savecheck") {
				$("#bottominputcontainer").slideDown();
				$('#topinputcontainer').slideDown();
				document.getElementById("anoncheck").style.display = "none";
			} else if(event.target.id == "anoncheck") {
				$('#topinputcontainer').slideUp();
				$("#questionnameinput").val('');
				$("#questionemailinput").val('');
			}
			checked.style.display = "block";
		} else {
			if(event.target.id == "savecheck") {
				$("#bottominputcontainer").slideUp();
				$('#topinputcontainer').slideUp();
				document.getElementById("anoncheck").style.display = "block";
			} else if(event.target.id == "anoncheck") {
				if(Meteor.user()) {
					$("#questionnameinput").val(Meteor.user().profile.name);
					$("#questionemailinput").val(Meteor.user().emails[0].address);
				} else {
					$('#topinputcontainer').slideDown();
					$("#questionnameinput").val("");
					$("#questionemailinput").val("");
				}
			}
			checked.style.display = "none";
		}
	},
	"click #buttonarea": function(event, template) {
		// Retrieves data from the form
		var question = document.getElementById("questioninput").value;
		question = $("<p>").html(question).text();
		var anonElement = document.getElementById("anoncheck");
		if(anonElement.style.display) {
			var anonymous = (anonElement.style.display != "none");
		} else {
			var anonymous = false;
		}
		var posterName = document.getElementById("questionnameinput").value;
		var posterEmail = document.getElementById("questionemailinput").value;
		var password1 = document.getElementById("questionpasswordinput");
		var password2 = document.getElementById("questionconfirminput");
		if(password1 && password2) {
			password1 = password1.value;
			password2 = password2.value;
		}
		if(Session.get("anonymous")) {
			if(anonymous) {
				posterName = "Anonymous";
				email = "";
			} else if(!posterName && !posterEmail) {
				posterName = "Anonymous";
				email = "";
			}
		} else {
			if(!posterName || !posterEmail) {
				showProposeError("Admin has disabled anonymous posting. Please enter your name and email address.");
				return false;
			}
		}
		// Checks whether the question input is blank
		if(!question) {
			showProposeError("Question cannot be left blank. Please try again.");
			return false;
		}
		// If the user entered a password, check the input
		if(password1 || password2) {
			var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			if(!posterEmail) {
				showProposeError("Please enter an email address.");
				return false;
			} else if (!posterName) {
				showProposeError("Please enter a name.");
				return false;
			} else if(!re.test(posterEmail)) {
				showProposeError("Enter a valid email address.");
				return false;
			} else if(posterName.length >= 30 || posterName.length <= 3) {
				showProposeError("Name must be between 3 and 30 characters.");
				return false;
			} else if(posterEmail.length >= 50 || posterEmail.length <= 7) {
				showProposeError("Email must be between 7 and 50 characters.");
				return false;
			} else if (password1 !== password2) {
				showProposeError("Passwords do not match.");
				return false;
			} else if(password2.length >= 30 || password2.length <= 6) {
				showProposeError("Password must be between 6 and 30 characters.");
				return false;
			} else {
				Meteor.call('register', posterEmail, password2, posterName, function(error, result) {
					if(result === 3) {
						showProposeError("Account with email already exists.");
						return false;
					} else if(result == 4) {
						showProposeError("Enter a name using less than 30 characters.");
						return false;
					} else if(result == 5) {
						showProposeError("Email must be between 7 and 50 characters.");
						return false;
					} else if(result == 1) {
						showProposeError("Enter a name and email address.");
						return false;
					} else if(result == 2) {
						showProposeError("Enter a valid email address.");
						return false;
					} else if(result == 6) {
						showProposeError("Password must be between 6 and 30 characters.");
						return false;
					} else {
						Meteor.loginWithPassword(posterEmail, password2, function(error) {
							if(error) {
								showProposeError(error);
								return false;
							}
						});
					}
				});
			}
		}
		// Calls server-side method to get the user's IP address
		Meteor.call('getIP', function (error, result) {
			if (!error) {
				// Calls server-side "propose" method to add question to DB
				Meteor.call('propose', Session.get("id"), Session.get("tablename"), question, posterName, posterEmail, result, function (error, result) {
					// If returns an object, there was an error
					if(typeof result === 'object') {
						// Store an object of the error names and codes
						var errorCodes = {
							"tablename": "Table name is invalid. Please return to the list and try again.",
							"text": "Posts must be between 10 and " + Session.get("questionLength") + " characters.",
							"poster": "Please enter a valid name using less than 30 characters.",
							"ip": "There was an error with your IP address. Please try again.",
							"timeorder": "There was an error retrieving the current time. Please try again.",
							"lasttouch": "There was an error retrieving the current time. Please try again.",
							"state": "Question state is invalid. Please return to the list and try again.",
							"votes": "# of votes is invalid. Please return to the list and try again.",
							"email": "Please enter a valid email address using less than 70 characters."
						}
						// Alert the error message
						showProposeError(errorCodes[result[0].name]);
						return false;
					} else {
						// If successful, redirect back to the list page
						//Router.go("/list");
						if(typeof currentError != "undefined") {
							Blaze.remove(currentError);
						}
						$("#toparea").slideUp();
						$("#navAsk").html("+ Ask");
						document.getElementById("navAsk").style.backgroundColor = "#27ae60";
						document.getElementById("questioninput").value = "";
						Blaze.remove(dropDownTemplate);
						//$("html, body").animate({ scrollTop: $(document).height() }, "slow");
					}
				});
			}
		});
	},
	"keyup #questioninput": function(event, template) {
		var urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
		var found = event.target.value.match(urlRegex);
		if(found) {
			var totalURL = 0;
			for(var f = 0; f < found.length; f++) {
				totalURL += found[f].length;
			}
			var total = (event.target.value.length - totalURL) + found.length;
			$("#questioninput").attr('maxlength', Number(Session.get("questionLength") + totalURL - found.length));
		} else {
			var total = event.target.value.length;
		}
		Session.set("questionCount", total);
	}
});

function showProposeError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementById("questiondiv");
	var nextNode = document.getElementById("questioninput");
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
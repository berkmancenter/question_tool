Template.create.onRendered(function() {
	document.getElementById("allowanoncheck").style.display = "block";
});

Template.create.events({
	"click .checkbox": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target.firstElementChild;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "advancedbox") {
				$("#instancebottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			checked.style.display = "none";
			if(event.target.id == "advancedbox") {
				$("#instancebottominputcontainer").slideUp();
			}
		}
	},
	"click .checked": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "advancedcheck") {
				$("#instancebottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			if(event.target.id == "advancedcheck") {
				$("#instancebottominputcontainer").slideUp();
			}
			checked.style.display = "none";
		}
	},
	"click .instancemodsplus": function(event, template) {
		var spacers = document.getElementsByClassName("emptyinputspacer");
		if(spacers.length <= 4) {
			var lastDiv = spacers[spacers.length-1];
			$(".instancemodsinput").removeClass("lastmodinput");
			$(".plusbuttoncontainer").removeClass("lastmodinput");
			$(".instancemodsplus").remove();
			$('<input class="instancemodsinput lastmodinput" type="text" placeholder="Moderator email..."><div class="emptyinputspacer lastinputspacer"><div class="plusbuttoncontainer"><div class="instancemodsplus">+</div></div></div>').insertAfter(".lastinputspacer").last();
			$(".lastinputspacer").first().removeClass("lastinputspacer");
			$('#instancebottominputcontainer').height(function (index, height) {
			    return (height + 50);
			});
		} else {
			showCreateError("You've reached the maximum # of moderators (4).");
			return false;
		}
	},
	"click #buttonarea": function(event, template) {
		if(!Meteor.user()) {
			return false;
		}
		//document.getElementById("buttonarea").disabled = true;
		var anonElement = document.getElementById("allowanoncheck");
		var anonymous;
		if(anonElement.style.display) {
			anonymous = (anonElement.style.display != "none");
		} else {
			anonymous = false;
		}
		// Retrieve data from the form
		var tablename = document.getElementById("instancenameinput").value;
		// Ensures that the table name is capitalzied
		tablename = tablename.charAt(0).toUpperCase() + tablename.slice(1);
		//var password = document.getElementsByName("pword1")[0].value;
		//var passwordConfirm = document.getElementsByName("pword2")[0].value;
		var threshholdSelect = document.getElementsByName("threshold")[0];
		var threshhold = threshholdSelect[threshholdSelect.selectedIndex].value;
		var lengthSelect = document.getElementsByName("new_length")[0];
		var redLength = lengthSelect[lengthSelect.selectedIndex].value;
		var staleSelect = document.getElementsByName("stale_length")[0];
		var stale = staleSelect[staleSelect.selectedIndex].value;
		var questionSelect = document.getElementsByName("max_question")[0];
		var maxQuestion = questionSelect[questionSelect.selectedIndex].value;
		var responseSelect = document.getElementsByName("max_response")[0];
		var maxResponse = responseSelect[responseSelect.selectedIndex].value;
		var description = document.getElementById("instancedescriptioninput").value;
		var admin = Meteor.user().emails[0].address;
		var hiddenSelector = document.getElementsByName("visibility")[0];
		var isHidden = (hiddenSelector[hiddenSelector.selectedIndex].value == "hidden");
		var author = Meteor.user().profile.name;
		// Ensures that the table description is capitalized
		description = description.charAt(0).toUpperCase() + description.slice(1);
		// If the passwords don't match, alert the user
		/*if(password != passwordConfirm) {
			alert("Passwords do not match. Please try again.");
			return false;
		}*/
		var modsInput = document.getElementsByClassName("instancemodsinput");
		var mods = [];
		for(var m = 0; m < modsInput.length; m++) {
			if(modsInput[m].value) {
				mods.push(modsInput[m].value.trim());
			}
		}
		//console.log(mods);
		// Calls the 'create' function on the server to add Instance to the DB
		Meteor.call('create', tablename, threshhold, redLength, stale, description, mods,/*passwordConfirm,*/ admin, maxQuestion, maxResponse, anonymous, isHidden, author, function (error, result) {
			// If the result is an object, there was an error
			if(typeof result === 'object') {
				// Store an object of the error names and codes
				var errorCodes = {
					"tablename": "Please enter a valid instance name using only letters and numbers, no spaces.",
					"threshhold": "Please enter a valid # of 'featured' questions using the drop down menu.",
					"new_length": "Please enter a valid value using the 'new questions' drop down menu.",
					"stale_length": "Please enter a valid value using the 'old questions' drop down menu.",
					"description": "Please enter a valid description under 255 characters.",
					"modlength": "You have entered too many moderators. Please try again."/*,
					"password": "Please enter a valid password using letters, numbers, *, #, @, and between 4 and 10 characters."*/
				};
				// Alert the error
				showCreateError(errorCodes[result[0].name]);
				return false;
			} else {
				// Redirects to the newly-created table's list page
				Blaze.remove(dropDownTemplate);
			}
		});
	},
	"keypress #instancedescriptioninput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("buttonarea").click();
		}
	},
	"keypress .instancemodsinput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			var last = document.getElementsByClassName("lastinputspacer")[0];
			var lastPlus = last.children[0].children[0];
			lastPlus.click();
			last = document.getElementsByClassName("lastinputspacer")[0];
			last.previousSibling.focus();
		}
	}
});

function showCreateError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
		document.getElementById("buttonarea").disabled = false;
	}
	var parentNode = document.getElementById("creatediv");
	var nextNode = document.getElementById("instancebottominputcontainer");
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
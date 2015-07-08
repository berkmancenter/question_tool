Template.add.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			// If not, return the user to the chooser page
			window.location.href = "/";
		} else {
			Meteor.call('adminCheck', Meteor.user().emails[0].address, Cookie.get("tablename"), function (error, result) {
				if(!result) {
					// If not, return the user to the chooser page
					window.location.href = "/";
				}
			});
		}
	});
});

Template.add.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Tool Moderator Area";
});

Template.add.helpers({
	// Sets the template tablename to the tablename Cookie
	tablename: Cookie.get("tablename"),
	mods: function() {
		var instance = Instances.findOne({
			tablename: Cookie.get("tablename")
		});
		var mods = [];
		for(var m = 0; m < instance.moderators.length; m++) {
			mods.push(instance.moderators[m]);
		}
		return mods;
	}
});

Template.add.events({
	"click .plusbutton": function(event, template) {
		var row = event.currentTarget.parentElement.parentElement;
		if(row.children.length >= 8) {
			alert("You have reached the maximum number of moderators. (8)");
			return false;
		}
		var buttons = row.getElementsByClassName("plusbutton");
		for(var i = 0; i < buttons.length; i++) {
			buttons[i].style.display = "none";
		}
		var line = document.createElement("div");
		line.className = "modline";
		var input = document.createElement("input");
		input.type = "text";
		input.style.clear = "both";
		input.maxLength = "45";
		input.className = "modbox";
		var plus = document.createElement("div");
		plus.className = "plusbutton";
		plus.innerHTML = "+";
		line.appendChild(input);
		line.appendChild(plus);
		row.appendChild(line);
	},
	"click .removebutton": function(event, template) {
		var mod = event.currentTarget.previousElementSibling.value;
		Meteor.call('removeMods', mod, Cookie.get("tablename"), Meteor.user().emails[0].address, function(error, result) {
			if(error) {
				alert(error);
			}
		});
	},
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var modsInput = document.getElementsByClassName("modbox");
		var mods = [];
		for(var m = 0; m < modsInput.length; m++) {
			if(modsInput[m].value) {
				mods.push(modsInput[m].value);
			}
		}
		Meteor.call('addMods', mods, Cookie.get("tablename"), Meteor.user().emails[0].address, function(error, result) {
			console.log(result);
			// If the result is an object, there was an error
			if(typeof result === 'object') {
				var errorString = "";
				// Store an object of the error names and codes
				var errorCodes = {
					"regEx": "Please enter valid email addresses."
				}
				// Retrieve all of the errors
				for(var e = 0; e < result.length; e++) {
					errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].type] + "\n\n";
				}
				// Alert the error
				alert(errorString);
			} else if(error) {
				alert(error);
			} else {
				window.location.href = '/list';
			}
		});
	},
	// If the enter key is pressed, submit the form
	"keypress .modbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementsByClassName("plusbutton")[0].click();
			var fields = document.getElementsByClassName("modbox");
			fields[fields.length - 1].focus();
		}
	}
});
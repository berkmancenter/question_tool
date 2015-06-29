Template.propose.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			// If not, redirect back to the chooser page
			window.location.href = "/";
		}
	});
});

Template.propose.onRendered(function() {
	// When the template is rendered, sets the document title
	document.title = "Live Question Tool Proposal Form";
});

Template.propose.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Retrieves data from the form
		var question = document.getElementsByName("comment")[0].value;
		var posterName = document.getElementsByName("poster")[0].value;
		var posterEmail = document.getElementsByName("email")[0].value;
		// Calls server-side method to get the user's IP address
		Meteor.call('getIP', function (error, result) {
			if (error) {
				// If there's an error, alert the user
				alert(error);
				return false;
			} else {
				// Calls server-side "propose" method to add question to DB
				Meteor.call('propose', Cookie.get("tablename"), question, posterName, posterEmail, result, function (error, result) {
					// If returns an object, there was an error
					if(typeof result === 'object') {
						var errorString = "";
						// Store an object of the error names and codes
						var errorCodes = {
							"tablename": "Table name is invalid. Please return to the list and try again.",
							"text": "Please enter a valid question using less than 255 characters.",
							"poster": "Please enter a valid name using less than 30 characters.",
							"ip": "There was an error with your IP address. Please try again.",
							"timeorder": "There was an error retrieving the current time. Please try again.",
							"lasttouch": "There was an error retrieving the current time. Please try again.",
							"state": "Question state is invalid. Please return to the list and try again.",
							"votes": "# of votes is invalid. Please return to the list and try again.",
							"email": "Please enter a valid email address using less than 70 characters."
						}
						// Retrieve error descriptions
						for(var e = 0; e < result.length; e++) {
							errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
						}
						// Alert the error message
						alert(errorString);
					} else {
						// If successful, redirect back to the list page
						window.location.href = '/list';
					}
				});
			}
		});
	},
	"keypress #emailbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
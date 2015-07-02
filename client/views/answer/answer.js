Template.answer.onCreated(function () {
	// Checks whether the user has a valid cookie, if not redirects
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		// If not, redirects back to the chooser page
		if(!result) {
			window.location.href = "/";
		}
	});
});

Template.answer.onRendered(function() {
	// Sets the document title
	document.title = "Live Question Tool Answer Form";
});

Template.answer.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Retrieves data from form
		var anonymous = document.getElementById("anonbox").checked;
		var answer = document.getElementsByName("comment")[0].value;
		var posterName = document.getElementsByName("poster")[0].value;
		var email = document.getElementsByName("email")[0].value;
		if(anonymous) {
			posterName = "Anonymous";
			email = "";
		}
		// Gets the question ID from the current URL
		var currentURL = window.location.href;
		currentURL = currentURL.split('/');
		currentURL = currentURL[currentURL.length - 1];
		// Gets the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			if(error) {
				console.log(error);
			} else {
				// If a name isn't specified, call them "Anonymous"
				if(!posterName) {
					posterName = "Anonymous";
				}
				// Calls a server-side method to answer a question and update DBs
				Meteor.call('answer', Cookie.get("tablename"), answer, posterName, email, result, currentURL, function (error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						var errorString = "";
						// Store an object of the error names and codes
						var errorCodes = {
							"text": "Please enter a valid answer using less than 255 characters.",
							"poster": "Please enter a valid name using less than 30 characters",
							"email": "Please enter a valid email address.",
							"ip": "There was an error with your IP address. Try again.",
							"tablename": "There was an error with the table name. Try again.",
							"qid": "There was an error with the question ID."
						}
						for(var e = 0; e < result.length; e++) {
							errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
						}
						// Alert the error
						alert(errorString);
					} else {
						// If successful, return to the list
						window.location.href = '/list';
					}
				});
			}
		});
	},
	// Submits form when the enter key is pressed
	"keypress #emailbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
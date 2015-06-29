Template.create.events({
	// When the submit button is pressed...
	"click #submitbutton": function(event, template) {
		// Retrieve data from the form
		var tablename = document.getElementsByName("tablename")[0].value;
		var password = document.getElementsByName("pword1")[0].value;
		var passwordConfirm = document.getElementsByName("pword2")[0].value;
		var threshholdSelect = document.getElementsByName("threshold")[0];
		var threshhold = threshholdSelect[threshholdSelect.selectedIndex].value;
		var lengthSelect = document.getElementsByName("new_length")[0];
		var redLength = lengthSelect[lengthSelect.selectedIndex].value;
		var staleSelect = document.getElementsByName("stale_length")[0];
		var stale = staleSelect[staleSelect.selectedIndex].value;
		var description = document.getElementsByName("description")[0].value;
		// If the passwords don't match, alert the user
		if(password != passwordConfirm) {
			alert("Passwords do not match. Please try again.");
			return false;
		}
		// Calls the 'create' function on the server to add Instance to the DB
		Meteor.call('create', tablename, threshhold, redLength, stale, description, passwordConfirm, function (error, result) {
			// If the result is an object, there was an error
			if(typeof result === 'object') {
				var errorString = "";
				// Store an object of the error names and codes
				var errorCodes = {
					"tablename": "Please enter a valid table name using only letters and numbers.",
					"threshhold": "Please enter a valid # of 'featured' questions using the drop down menu.",
					"new_length": "Please enter a valid value using the 'new questions' drop down menu.",
					"stale_length": "Please enter a valid value using the 'old questions' drop down menu.",
					"description": "Please enter a valid description under 255 characters.",
					"password": "Please enter a valid password using letters, numbers, *, #, @, and between 4 and 10 characters."
				}
				// Retrieve all of the errors
				for(var e = 0; e < result.length; e++) {
					errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
				}
				// Alert the error
				alert(errorString);
			} else {
				// Redirects to the newly-created table's list page
				Cookie.set('tablename', result);
				window.location.href = '/list';
			}
		});
	}
});

Template.create.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Tool Creation Area";
});
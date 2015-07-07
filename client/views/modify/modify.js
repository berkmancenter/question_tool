Template.modify.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			// If not, redirect back to the chooser page
			window.location.href = "/";
		} else {
			// Checks whether the user has proper admin privileges
			Meteor.call('adminCheck', Meteor.user().emails[0].address, Cookie.get("tablename"), function (error, result) {
				if(!result) {
					// If not, redirects back to the list page
					window.location.href = "/list";
				}
			});
		}
	});
});

Template.modify.onRendered(function() {
	// When the template is rendered, sets the document title
	document.title = "Live Question Tool Modification Form";
});

Template.modify.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Retrieves data from the form
		var question = document.getElementsByName("comment")[0].value;
		// Calls the server-side "modify" method to update the DBs
		Meteor.call('modify', question, template.data._id, Meteor.user().emails[0].address, Cookie.get("tablename"), function (error, result) { 
			if(result) {
				// If successful, redirect back to the list page
				window.location.href = "/list";
			}
		});
	},
	// If the enter key is pressed, submit the form
	"keypress #modifybox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
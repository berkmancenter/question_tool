Template.delete.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Session.get("tablename"), function (error, result) {
		if(!result) {
			// If not, redirect back to the chooser page
			window.location.href = "/";
		} else {
			// Checks whether the current user has admin privileges
			Meteor.call('adminCheck', Cookie.get("admin_pw"), Session.get("tablename"), function (error, result) {
				// If not, redirect back to the list page
				if(!result) {
					window.location.href = "/list";
				}
			});
		}
	});
});

Template.delete.helpers({
	// Sets the template's "tablename" to the tablename Cookie
	tablename: Session.get("tablename")
});

Template.delete.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Tool Instance Delete";
});

Template.delete.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Calls the 'remove' method on the server to update the DBs
		Meteor.call('remove', Session.get("tablename"), function (error, result) {
			// If an error exists, alert it
			if(error) {
				alert(error);
			} else {
				// If the delete was successful, redirect back to the chooser page
				window.location.href = "/";
			}
		});
	}
});

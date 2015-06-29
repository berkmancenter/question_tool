Template.combine.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		// If not, redirects back to the chooser page
		if(!result) {
			window.location.href = "/";
		} else {
			// Checks whether the current user has admin privileges
			Meteor.call('adminCheck', Cookie.get("admin_pw"), Cookie.get("tablename"), function (error, result) {
				if(!result) {
					// If not, return back to the list
					window.location.href = "/list";
				}
			});
		}
	});
});

Template.combine.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Tool Combination Form";
});

Template.combine.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Retrieves data from form
		var question = document.getElementsByName("comment")[0].value;
		// Calls the combine function on the server to update the DBs
		Meteor.call('combine', question, template.data.first._id, template.data.second._id, Cookie.get("admin_pw"), Cookie.get("tablename"), function (error, result) { 
			// If successful
			if(!error) {
				// Hides the second question (combined -> first)
				Meteor.call('hide', template.data.second._id, function (error, result) { 
					if(!error) {
						//If successful, return to the list
						window.location.href = "/list";
					}
				});
			}
		});
	},
	// When enter button is pressed, submit the form
	"keypress #modifybox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
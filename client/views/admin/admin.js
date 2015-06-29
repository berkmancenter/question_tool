Template.admin.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Tool Admin Login Area";
});

Template.admin.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var password = document.getElementsByName("pword")[0].value;
		Meteor.call('admin', password, function (error, result) { 
			if(result) {
				Cookie.set("tooladmin_pw", result);
				window.location.href = "/";
			} else {
				alert("Password was incorrect. Please try again.");
			}
		});
	},
	// If the enter key is pressed, submit the form
	"keypress #passwordbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
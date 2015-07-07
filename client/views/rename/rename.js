Template.rename.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Rename Question Tool";
});

Template.rename.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var newName = document.getElementsByName("tname")[0].value;
		console.log(template.data._id);
		console.log(newName);
		console.log(Cookie.get("admin_pw"));
		Meteor.call('rename', template.data._id, newName, Cookie.get("admin_pw"), 1, function (error, result) { 
			if(result) {
				Cookie.set("tablename", result);
				window.location.href = "/list";
			} else {
				alert("There was an error. Please try again.");
			}
		});
	},
	// If the enter key is pressed, submit the form
	"keypress #namebox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
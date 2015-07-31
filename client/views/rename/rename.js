Template.rename.onRendered(function() {
	// When the template is rendered, set the document title
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.rename.helpers({
	renamename: function() {
		return Session.get("tablename");
	},
	renameid: function() {
		return Session.get("id");
	}
})

Template.rename.events({
	// When the submit button is clicked...
	"click .renamesubmitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var newName = document.getElementById("namebox").value;
		if(newName == Session.get("tablename")) {
			return false;
		}
		Meteor.call('rename', event.target.id, newName, Meteor.user().emails[0].address, 2, function (error, result) { 
			if(result == 3) {
				Cookie.set("tablename", newName);
				window.location.reload();
			} else if(result == 2) {
				showRenameError("Insufficient permissions.");
			} else if (result == 1) {
				showRenameError("Name is already taken.");
			}
		});
	},
	// If the enter key is pressed, submit the form
	"keypress #namebox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementsByClassName("renamesubmitbutton")[0].click();
		}
	},
	"click #darker": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
	}
});

function showRenameError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementsByClassName("formcontainer")[0];
	var nextNode = document.getElementsByClassName("inputcontainer")[0];
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
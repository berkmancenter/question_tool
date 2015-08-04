Template.rename.onRendered(function() {
	// When the template is rendered, set the document title
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.rename.helpers({
	renamename: function() {
		return Template.instance().data.tablename;
	},
	renameid: function() {
		return Template.instance().data.id;
	}
})

Template.rename.events({
	// When the submit button is clicked...
	"click .renamesubmitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var newName = document.getElementById("namebox").value;
		if(newName == Template.instance().data.tablename) {
			return false;
		}
		Meteor.call('rename', Template.instance().data.id, newName, function (error, result) { 
			if(result == 2) {
				showRenameError("Insufficient permissions.");
			} else if (result == 1) {
				showRenameError("Name is already taken.");
			} else {
				if(template.data.isList) {
					window.location.href = "/list/" + newName;
				}
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
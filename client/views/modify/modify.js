Template.modify.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Session.get("tablename"), function (error, result) {
		if(!result) {
			// If not, redirect back to the chooser page
			window.location.href = "/";
		} else {
			// Checks whether the user has proper admin privileges
			Meteor.call('adminCheck', Session.get("tablename"), function (error, result) {
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
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.modify.helpers({
	questiontext: function() {
		return Questions.findOne({
			_id: Template.instance().data
		}).text;
	},
	maxmodlength: function() {
		return Session.get("questionLength");
	}
});

Template.modify.events({
	// When the submit button is clicked...
	"click .modifysubmitbutton": function(event, template) {
		// Retrieves data from the form
		var question = document.getElementsByName("comment")[0].value;
		if(!question) {
			showModifyError("Please enter a question.");
			return false;
		}
		// Calls the server-side "modify" method to update the DBs
		Meteor.call('modify', question, event.currentTarget.id, Session.get("tablename"), function (error, result) { 
			if(result) {
				// If successful, redirect back to the list page
				//window.location.href = "/list";
				$(".formcontainer").fadeOut(400);
				$("#darker").fadeOut(400, function() {
					Blaze.remove(popoverTemplate);
				});
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
	},
	"click #darker": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
	}
});

function showModifyError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementsByClassName("formcontainer")[0];
	var nextNode = document.getElementsByClassName("inputcontainer")[0];
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
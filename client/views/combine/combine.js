Template.combine.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Session.get("tablename"), function (error, result) {
		// If not, redirects back to the chooser page
		if(!result) {
			window.location.href = "/";
		} else {
			// Checks whether the current user has admin privileges
			Meteor.call('adminCheck', Session.get("id"), function (error, result) {
				if(!result) {
					// If not, redirects back to the list page
					window.location.href = "/list";
				}
			});
		}
	});
});

Template.combine.onRendered(function() {
	// Sets the document title when the template is rendered
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
	//console.log(Template.instance().data);
});

Template.combine.helpers({
	firsttext: function() {
		return Questions.findOne({
			_id: Template.instance().data.first
		}).text.trim();
	},
	secondtext: function() {
		return Questions.findOne({
			_id: Template.instance().data.second
		}).text.trim();
	}
})

Template.combine.events({
	// When the submit button is clicked...
	"click .combinesubmitbutton": function(event, template) {
		// Retrieves data from form
		var question = document.getElementById("modifybox").value;
		// Calls the combine function on the server to update the DBs
		var id2 = Template.instance().data.second;
		var id1 = Template.instance().data.first;
		Meteor.call('combine', question, id1, id2, Session.get("id"), function (error, result) { 
			// If successful
			if(!error) {
				// Hides the second question (combined -> first)
				Meteor.call('hide', id2, function (error, result) { 
					if(!error) {
						//If successful, fade the modal out
						window.location.reload();
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
	},
	"click #darker": function(event, template) {
		$(".formcontainer").fadeOut(400);
		$("#darker").fadeOut(400, function() {
			Blaze.remove(popoverTemplate);
		});
		window.location.reload();
	},
	"click .closecontainer": function(event, template) {
		window.location.reload();
	}
});
Template.rename.onRendered(function() {
	// When the template is rendered, set the document title
	$(".formcontainer").hide().fadeIn(400);
	$("#darker").hide().fadeIn(400);
});

Template.rename.events({
	"click .renamesubmitbutton": function(event, template) {
		var newName = document.getElementById("namebox").value,
			newDesc = document.getElementById("descriptionbox").value,
			table = Template.instance().data.table;
		newDesc = newDesc.charAt(0).toUpperCase() + newDesc.slice(1);
		newDesc = UniHTML.purify(newDesc, {withoutTags: ['a', 'img', 'ol', 'ul' , 'span' , 'br' , 'table' , 'caption' , 'col' , 'colgroup' , 'tbody' , 'td' , 'tfoot' , 'th' , 'thread' , 'tr' , 'li' ]});
		if(newName == table.tablename && newDesc == table.description) {
			return false;
		}
		Meteor.call('rename', table._id, newName, newDesc, function (error, result) { 
			if(result == 2) {
				showRenameError("Insufficient permissions.");
			} else if (result == 1) {
				showRenameError("Name is already taken.");
			} else {
				if(template.data.isList) {
					var instance = Instances.findOne({
						_id: Session.get("id")
					});
					window.location.href = "/list/" + instance.slug;
				}
				else{
					Blaze.remove(popoverTemplate);
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
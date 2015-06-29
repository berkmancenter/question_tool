Template.dashboard.helpers({
	instances: function() {
		return Instances.find().fetch();
	}
});

Template.dashboard.events({
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', Cookie.get("tooladmin_pw"), event.currentTarget.id, function(error, result) {
				if(error) {
					alert(error);
				}
			});
		}
	},
	"click .renamebutton": function(event, template) {
		if(event.currentTarget.children[0].id == "rename") {
			event.currentTarget.children[0].innerHTML = "Done";
			event.currentTarget.children[0].id = "done";
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			var tableName = tableNode.children[0].children[0].innerHTML;
			tableNode.children[0].style.display = "none";
			tableNode.children[1].className = "visibleinput";
		} else if(event.currentTarget.children[0].id == "done") {
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			tableNode.children[0].style.display = "inline";
			tableNode.children[1].className = "hiddeninput";
			Meteor.call('rename', event.currentTarget.id, tableNode.children[1].value, Cookie.get("tooladmin_pw"), function(error, result) {
				event.currentTarget.children[0].innerHTML = "Rename";
			});
			event.currentTarget.children[0].id = "rename";
		}
	}
})
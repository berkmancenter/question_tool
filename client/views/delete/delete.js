Template.delete.helpers({
	tablename: Cookie.get("tablename")
});

Template.delete.events({
	"click #submitbutton": function(event, template) {
		Meteor.call('remove', Cookie.get("tablename"), function (error, result) {
			if(error) {
				alert(error);
			} else {
				window.location.href = "/";
			}
		});
	}
});

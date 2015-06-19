Template.delete.onCreated(function () {
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		} else {
			Meteor.call('adminCheck', Cookie.get("admin_pw"), Cookie.get("tablename"), function (error, result) {
				if(!result) {
					window.location.href = "/list";
				}
			});
		}
	});
});

Template.delete.helpers({
	tablename: Cookie.get("tablename")
});

Template.delete.events({
	"click #submitbutton": function(event, template) {
		Meteor.call('remove', Cookie.get("admin_pw"), Cookie.get("tablename"), function (error, result) {
			if(error) {
				alert(error);
			} else {
				window.location.href = "/";
			}
		});
	}
});

Template.combine.onCreated(function () {
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

Template.combine.onRendered(function() {
	document.title = "Live Question Tool Combination Form";
});

Template.combine.events({
	"click #submitbutton": function(event, template) {
		var question = document.getElementsByName("comment")[0].value;
		Meteor.call('modify', question, template.data._id, Cookie.get("admin_pw"), Cookie.get("tablename"), function (error, result) { 
			if(!result) {
				window.location.href = "/list";
			}
		});
	},
	"keypress #modifybox": function(e, template) {
		e.which = e.which || e.keyCode;
		if(e.which == 13) {
			e.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
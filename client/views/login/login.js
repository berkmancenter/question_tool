Template.login.onCreated(function () {
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		}
	});
});

Template.login.helpers({
	tablename: Cookie.get("tablename"),
	description: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		return table.description;
	}
});

Template.login.events({
	"click #submitbutton": function(event, template) {
		var password = document.getElementsByName("pword")[0].value;
		var instance = Instances.findOne({
			tablename: Cookie.get("tablename")
		});
		if(password == instance.password) {
			Cookie.set("admin_pw", password);
			window.location.href = "/list";
		} else {
			// Incorrect password. Do something here.
			alert("Password was incorrect");
			window.location.reload();
		}
	},
	"keypress #passwordbox": function(e, template) {
		e.which = e.which || e.keyCode;
		console.log(e.which);
		if(e.which == 13) {
			e.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
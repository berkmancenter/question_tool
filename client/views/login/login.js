Template.login.onCreated(function () {
	// Checks whether the user has a valid table cookie
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			// If not, return the user to the chooser page
			window.location.href = "/";
		}
	});
});

Template.login.helpers({
	// Sets the template tablename to the tablename Cookie
	tablename: Cookie.get("tablename"),
	// Retrieves table description and sets to template description
	description: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		return table.description;
	}
});

Template.login.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Tool Admin Login Area";
});

Template.login.events({
	// When the submit button is clicked...
	"click #submitbutton": function(event, template) {
		// Checks whether the proper password was submitted
		var password = document.getElementsByName("pword")[0].value;
		var instance = Instances.findOne({
			tablename: Cookie.get("tablename")
		});
		if(password == instance.password) {
			Cookie.set("admin_pw", password);
			window.location.href = "/list";
		} else {
			// If the password is incorrect, notfiy the user
			alert("Password was incorrect");
			return false;
		}
	},
	// If the enter key is pressed, submit the form
	"keypress #passwordbox": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
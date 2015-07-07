Template.instanceoptions.helpers({
	// Return all of the instances into the option chooser
	instances: function() {
		var instances = Instances.find().fetch();
		instances.sort(function(a, b) {
		    return a.order - b.order;
		});
		return instances
	}
});

Template.submitbutton.events({
	// When the submit button is clicked
	"click #submitbutton": function(event, template) {
		// Sets the tablename cookie to the chosen table
		var instances = document.getElementsByTagName("select")[0];
		var selectedInstance = instances.options[instances.selectedIndex].text;
		Cookie.set('tablename', selectedInstance, {
			path: '/'
		});
		// Redirects to the list
		Router.go('/list');
	}
});

Template.home.onCreated(function() {
	if(Cookie.get("tooladmin_pw")) {
		Meteor.call('admin', Cookie.get("tooladmin_pw"), function(error, result) {
			if(result) {
				Session.set("toolAdmin", true);
			}
		});
	}
	if(Cookie.get("tablename")) {
		Meteor.call('listCookieCheck', Cookie.get("tablename"), function(error, result) {
			if(result) {
				Session.set("hasCookie", true);
			} else {
				Session.set("hasCookie", false);
			}
		});
	} else {
		Session.set("hasCookie", false);
	}
});

Template.home.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Tool Chooser";
});

Template.home.helpers({
	toolAdmin: function() {
		return Session.get("toolAdmin");
	},
	hasCookie: function() {
		return Session.get("hasCookie");
	}
	
});

Template.home.events({
	// When the logout button is clicked
	"click #logoutbutton": function(event, template) {
		Cookie.set("tooladmin_pw", "");
		Session.set("toolAdmin", false);
	}
})



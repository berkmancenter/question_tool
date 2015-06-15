if (Meteor.isClient) {
	// counter starts at 0
	Session.setDefault('counter', 0);

	Template.instanceoptions.helpers({
		instances: function() {
			// get the list of instances here
			return [{name: "test1"}, {name: "test2"}, {name: "test3"}, {name: "test4"}, {name: "test5"}];
		}
	});
	
	Template.submitbutton.events({
		"click #submitbutton": function(event, template) {
			var instances = document.getElementsByTagName("select")[0];
			var selectedInstance = instances.options[instances.selectedIndex].text;
			Cookie.set('tablename', selectedInstance);
		}
	})
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}

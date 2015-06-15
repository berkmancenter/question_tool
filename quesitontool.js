if (Meteor.isClient) {
	// counter starts at 0
	Session.setDefault('counter', 0);

	Template.instanceoptions.helpers({
		instances: function() {
			// get the list of instances here
			return [{name: "test1"}, {name: "test2"}, {name: "test3"}, {name: "test4"}, {name: "test5"}];
		}
	});

	Template.instanceoptions.events({
  
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}

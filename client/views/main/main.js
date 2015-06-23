Template.instanceoptions.helpers({
	instances: function() {
		return Instances.find();
	}
});

Template.submitbutton.events({
	"click #submitbutton": function(event, template) {
		var instances = document.getElementsByTagName("select")[0];
		var selectedInstance = instances.options[instances.selectedIndex].text;
		Cookie.set('tablename', selectedInstance, {
			path: '/'
		});
		window.location.href = '/list';
	}
});

Template.home.onRendered(function() {
	document.title = "Live Question Tool Chooser";
});



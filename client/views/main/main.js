Template.instanceoptions.helpers({
	// Return all of the instances into the option chooser
	instances: function() {
		return Instances.find();
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
		window.location.href = '/list';
	}
});

Template.home.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Tool Chooser";
});



Template.home.onCreated(function() {
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
		Meteor.call('admin', Meteor.user().emails[0].address, function(error, result) {
			if(result) {
				Session.set("toolAdmin", true);
			}
		});
		return Session.get("toolAdmin");
	},
	hasCookie: function() {
		return Session.get("hasCookie");
	},
	instances: function() {
		var instances = Instances.find({
			admin: Meteor.user().emails[0].address
		}).fetch();
		for(var i = 0; i < instances.length; i++) {
			instances[i].userAdmin = true;
		}
		var moderators = Instances.find({
			moderators: Meteor.user().emails[0].address
		}).fetch();
		for(var m = 0; m < moderators.length; m++) {
			moderators[m].userModerator = true;
		}
		var final = instances.concat(moderators);
		return final;
	},
	instanceList: function() {
		var instances = Instances.find().fetch();
		instances.sort(function(a, b) {
		    return a.order - b.order;
		});
		return instances;
	}
});

Template.home.events({
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', false, event.currentTarget.id, Meteor.user().emails[0].address, function(error, result) {
				if(error) {
					alert(error);
				}
			});
		}
	},
	"click .renamebutton": function(event, template) {
		if(event.currentTarget.children[0].id == "rename") {
			event.currentTarget.children[0].innerHTML = "Done";
			event.currentTarget.children[0].id = "done";
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			var tableName = tableNode.children[0].children[0].innerHTML;
			tableNode.children[0].style.display = "none";
			tableNode.children[1].className = "visibleinput";
		} else if(event.currentTarget.children[0].id == "done") {
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			tableNode.children[0].style.display = "inline";
			tableNode.children[1].className = "hiddeninput";
			Meteor.call('rename', event.currentTarget.id, tableNode.children[1].value, Meteor.user().emails[0].address, 2, function(error, result) {
				event.currentTarget.children[0].innerHTML = "Rename";
			});
			event.currentTarget.children[0].id = "rename";
		}
	},
	"keypress input": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			event.currentTarget.parentNode.parentNode.children[1].children[0].click();
		}
	},
	// When the submit button is clicked
	"click #submitbutton": function(event, template) {
		// Sets the tablename cookie to the chosen table
		var instances = document.getElementsByTagName("select")[0];
		var selectedInstance = instances.options[instances.selectedIndex].text;
		Cookie.set('tablename', selectedInstance, {
			path: '/'
		});
		// Redirects to the list
		window.location.href = "/list";
		//Router.go('/list');
	}
})



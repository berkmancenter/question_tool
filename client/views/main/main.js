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
		var re = new RegExp(Session.get("search"), "i");
		if(Session.get("search") == "all") {
			var instances = Instances.find().fetch();
		} else {
			var instances = Instances.find({
				"$or": [{
					tablename: {
						$regex: re
					}
				}, {
					description: {
						$regex: re
					}
				}]
			}).fetch();
		}
		instances.sort(function(a, b) {
		    return a.order - b.order;
		});
		for(var i = 0; i < instances.length; i++) {
			instances[i].lasttouch = timeSince(instances[i].lasttouch);
			if(i % 3 == 0) {
				instances[i].indexOne = true;
			} else if(i % 3 == 1) {
				instances[i].indexTwo = true;
			} else if(i % 3 == 2) {
				instances[i].indexThree = true;
			}
			if(Meteor.user()) {
				if(Meteor.user().profile.favorites.indexOf(instances[i]._id) != -1) {
					instances[i].isFavorite = true;
					var tempInstance = instances[i];
					instances.splice(i, 1);
					instances.unshift(tempInstance);
				}
			}
		}
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
	"click .instance": function(event, template) {
		// Sets the tablename cookie to the chosen table
		var theID = event.target.id;
		var theInstance = Instances.findOne({
			_id: theID
		});
		//var instances = document.getElementsByTagName("select")[0];
		//var selectedInstance = instances.options[instances.selectedIndex].text;
		Cookie.set('tablename', theInstance.tablename, {
			path: '/'
		});
		// Redirects to the list
		window.location.href = "/list";
		//Router.go('/list');
	},
	"keyup #searchbar": function(event, template) {
		if(event.target.value) {
			Session.set("search", event.target.value);
		} else {
			Session.set("search", "all");
		}
		//return Users.find({name: {$regex: re}});
	},
	"click .favoritebutton": function(event, template) {
		var style = event.target.currentStyle || window.getComputedStyle(event.target, false),
		bi = style.backgroundImage.slice(4, -1);
		event.stopPropagation();
		if(bi == (event.target.baseURI + "heart_empty.png")) {
			event.target.style.backgroundImage = "url('" + event.target.baseURI + "heart_filled.png')";
			event.target.parentElement.style.border = "2px solid #ec4f4f";
			Meteor.call('addFavorite', event.target.id, function(error, result) {
				if(error) {
					alert(error);
				}
			});
		} else {
			event.target.style.backgroundImage = "url('" + event.target.baseURI + "heart_empty.png')";
			event.target.parentElement.style.border = "2px solid #e9edf0";
			Meteor.call('removeFavorite', event.target.id, function(error, result) {
				if(error) {
					alert(error);
				}
			});
		}
	}
});

// Helper function that gets the time since a date
function timeSince(date) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'Year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'Month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'Day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "Hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "Minute";
                    } else {
                        interval = seconds;
                        intervalType = "Second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType;
};

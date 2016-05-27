Template.home.onCreated(function() {
	Session.set("search", "");
});

Template.home.onRendered(function() {
	// When the template is rendered, set the document title
	document.title = "Live Question Answer Tool Chooser";
	this.autorun(function() {
		if(Meteor.user()) {
			Meteor.call('superadmin', function(error, result) {
				Session.set("superadmin", result);
			});
		}
	});
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
	hasToday: function() {
		var instances = Template.instance().data;
		var greatest = 0;
		for(var i = 0; i < instances.length; i++) {
			if(instances[i].lasttouch > greatest) {
				greatest = instances[i].lasttouch;
			}
		}
		var ht = (greatest > (new Date().getTime() - 86400000));
		return ht;
	},
	hasWeek: function() {
		var instances = Template.instance().data;
		var hw;
		for(var i = 0; i < instances.length; i++) {
			if(instances[i].lasttouch > (new Date().getTime() - 604800000)) {
				if(instances[i].lasttouch < (new Date().getTime() - 86400000)) {
					return true;
				}
			}
		}
		return false;
	},
	hasMonth: function() {
		var instances = Template.instance().data;
		var oldest = new Date().getTime();
		for(var i = 0; i < instances.length; i++) {
			if(instances[i].lasttouch < oldest) {
				oldest = instances[i].lasttouch;
			}
		}
		var hm = (oldest > (new Date().getTime() - 2678400000)) && (oldest < (new Date().getTime() - 604800000));
		return hm;
	},
	instanceList: function() {
		var re = new RegExp(Session.get("search"), "i");
		if(Session.get("search") == "all") {
			var instances = Template.instance().data;
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
				}, {
					author: {
						$regex: re
					}
				}]
			}).fetch();
		}
		instances.sort(function(a, b) {
		    return b.lasttouch - a.lasttouch;
		});
		for(var i = 0; i < instances.length; i++) {
			if(Meteor.user()) {
				if(Meteor.user().profile.favorites) {
					if(Meteor.user().profile.favorites.indexOf(instances[i]._id) != -1) {
						instances[i].isFavorite = true;
					}
				}
				if(instances[i].admin == Meteor.user().emails[0].address) {
					instances[i].isAdmin = true;
				} else if(instances[i].moderators) {
					if(instances[i].moderators.indexOf(Meteor.user().emails[0].address) != -1) {
						instances[i].isMod = true;
					}
				}
			}
			if(instances[i].description.length > 140) {
				instances[i].description = instances[i].description.substring(0, 137) + "...";
			}
			if(instances[i].tablename.length > 15) {
				instances[i].tablename = instances[i].tablename.substring(0, 13) + "...";
			}
			if(!instances[i].author) {
				instances[i].author = "Anonymous";
			}
			if((new Date().getTime() - instances[i].lasttouch) <= 86400000) {
				instances[i].today = true;
			} else if((new Date().getTime() - instances[i].lasttouch) <= 604800000) {
				instances[i].week = true;
			} else if((new Date().getTime() - instances[i].lasttouch) <= 2678400000) {
				instances[i].month = true;
			}
			instances[i].lasttouch = timeSince(instances[i].lasttouch);
		}
		if(instances.length < 1) {
			showCreateError("Nothing found.");
		}
		else {
			if(typeof currentError != "undefined") {
				Blaze.remove(currentError);
			}
		}
		return instances;
	}
});

Template.home.events({
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', event.currentTarget.id);
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
			Meteor.call('rename', event.currentTarget.id, tableNode.children[1].value, function(error, result) {
				event.currentTarget.children[0].innerHTML = "Rename";
			});
			event.currentTarget.children[0].id = "rename";
		}
	},
	// When the submit button is clicked
	"keyup #searchbar": function(event, template) {
		if(event.target.value) {
			Session.set("search", event.target.value);
		} else {
			Session.set("search", "");
		}
		//return Users.find({name: {$regex: re}});
	},
	"click .favoritebutton": function(event, template) {
		var style = event.target.currentStyle || window.getComputedStyle(event.target, false),
		bi = style.backgroundImage.slice(4, -1).replace(/['"]+/g, '');
		event.stopPropagation();
		if(bi == (event.target.baseURI + "heart_empty.png")) {
			event.target.style.backgroundImage = "url('" + event.target.baseURI + "heart_filled.png')";
			event.target.parentElement.style.border = "2px solid #ec4f4f";
			Meteor.call('addFavorite', event.target.id);
		} else {
			event.target.style.backgroundImage = "url('" + event.target.baseURI + "heart_empty.png')";
			event.target.parentElement.style.border = "2px solid #e9edf0";
			Meteor.call('removeFavorite', event.target.id);
		}
	},
	"click #navCreate": function(event, template) {
		if(Meteor.user()) {
			var parentNode = document.getElementById("main-wrapper");
			var nextNode = document.getElementById("recent");
			dropDownTemplate = Blaze.render(Template.create, parentNode, nextNode);
			var questionDiv = document.getElementById("toparea");
			if(questionDiv.style.display == "none" || !questionDiv.style.display) {
				$("#navCreate").html("Close");
				document.getElementById("navCreate").style.backgroundColor = "#ec4f4f";
				$("#toparea").slideDown();
			} else {
				if(typeof currentError != "undefined") {
					Blaze.remove(currentError);
				}
				$("#navCreate").html("+ Create");
				document.getElementById("navCreate").style.backgroundColor = "#27ae60";
				$("#toparea").slideUp();
				if(typeof dropDownTemplate != "undefined") {
					Blaze.remove(dropDownTemplate);
				}
			}
			//Router.go('/create');
		} else {
			var parentNode = document.getElementById("banner");
			popoverTemplate = Blaze.render(Template.register, parentNode);
		}
	},
	"click .superadmindeletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', event.currentTarget.id);
		}
		event.stopPropogation();
	},
	"click .superadminrenamebutton": function(event, template) {
		var parentNode = document.getElementById("banner");
		var tablename = Instances.findOne({
			_id: event.currentTarget.id
		}).tablename;
		popoverTemplate = Blaze.renderWithData(Template.rename, {
			id: event.currentTarget.id,
			tablename: tablename,
			isList: false
		}, parentNode);
		event.stopPropogation();
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
}

function showCreateError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementById("recent");
	var nextNode = document.getElementById("questionscontainer");
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

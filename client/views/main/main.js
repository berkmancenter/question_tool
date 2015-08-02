Template.home.onCreated(function() {
	Session.set("search", "");
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
	document.getElementById("allowanoncheck").style.display = "block";
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
		for(var ii = 0; ii < instances.length; ii++) {
			if(Meteor.user()) {
				if(Meteor.user().profile.favorites) {
					if(Meteor.user().profile.favorites.indexOf(instances[ii]._id) != -1) {
						instances[ii].isFavorite = true;
						/*var tempInstance = instances[ii];
						instances.splice(ii, 1);
						instances.unshift(tempInstance);*/
					}
				}
				if(instances[ii].admin == Meteor.user().emails[0].address) {
					instances[ii].isAdmin = true;
				} else if(instances[ii].moderators) {
					if(instances[ii].moderators.indexOf(Meteor.user().emails[0].address) != -1) {
						instances[ii].isMod = true;
					}
				}
			}
		}
		for(var i = 0; i < instances.length; i++) {
			if(instances[i].description.length > 140) {
				instances[i].description = instances[i].description.substring(0, 137) + "...";
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
			if(i % 3 == 0) {
				instances[i].indexOne = true;
			} else if(i % 3 == 1) {
				instances[i].indexTwo = true;
			} else if(i % 3 == 2) {
				instances[i].indexThree = true;
			}
		}
		return instances;
	}
});

Template.home.events({
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', false, event.currentTarget.id, Meteor.user().emails[0].address);
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
	// When the submit button is clicked
	"click .instance": function(event, template) {
		// Sets the tablename cookie to the chosen table
		var theID = event.target.id;
		var theInstance = Instances.findOne({
			_id: theID
		});
		//var instances = document.getElementsByTagName("select")[0];
		//var selectedInstance = instances.options[instances.selectedIndex].text;
		Cookie.set('tablename', theInstance.tablename);
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
			Meteor.call('addFavorite', event.target.id);
		} else {
			event.target.style.backgroundImage = "url('" + event.target.baseURI + "heart_empty.png')";
			event.target.parentElement.style.border = "2px solid #e9edf0";
			Meteor.call('removeFavorite', event.target.id);
		}
	},
	"click #navCreate": function(event, template) {
		if(Meteor.user()) {
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
			}
			//Router.go('/create');
		} else {
			var parentNode = document.getElementById("banner");
			popoverTemplate = Blaze.render(Template.register, parentNode);
		}
	},
	"click .checkbox": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target.firstElementChild;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "advancedbox") {
				$("#instancebottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			checked.style.display = "none";
			if(event.target.id == "advancedbox") {
				$("#instancebottominputcontainer").slideUp();
			}
		}
	},
	"click .checked": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "advancedcheck") {
				$("#instancebottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			if(event.target.id == "advancedcheck") {
				$("#instancebottominputcontainer").slideUp();
			}
			checked.style.display = "none";
		}
	},
	"click .instancemodsplus": function(event, template) {
		var spacers = document.getElementsByClassName("emptyinputspacer");
		if(spacers.length <= 4) {
			var lastDiv = spacers[spacers.length-1];
			$(".instancemodsinput").removeClass("lastmodinput");
			$(".plusbuttoncontainer").removeClass("lastmodinput");
			$(".instancemodsplus").remove();
			$('<input class="instancemodsinput lastmodinput" type="text" placeholder="Moderator email..."><div class="emptyinputspacer lastinputspacer"><div class="plusbuttoncontainer"><div class="instancemodsplus">+</div></div></div>').insertAfter(".lastinputspacer").last();
			$(".lastinputspacer").first().removeClass("lastinputspacer");
			$('#instancebottominputcontainer').height(function (index, height) {
			    return (height + 50);
			});
		} else {
			showCreateError("You've reached the maximum # of moderators (4).");
			return false;
		}
	},
	"click #buttonarea": function(event, template) {
		if(!Meteor.user()) {
			return false;
		}
		var anonElement = document.getElementById("allowanoncheck");
		if(anonElement.style.display) {
			var anonymous = (anonElement.style.display != "none");
		} else {
			var anonymous = false;
		}
		// Retrieve data from the form
		var tablename = document.getElementById("instancenameinput").value;
		// Ensures that the table name is capitalzied
		tablename = tablename.charAt(0).toUpperCase() + tablename.slice(1);
		//var password = document.getElementsByName("pword1")[0].value;
		//var passwordConfirm = document.getElementsByName("pword2")[0].value;
		var threshholdSelect = document.getElementsByName("threshold")[0];
		var threshhold = threshholdSelect[threshholdSelect.selectedIndex].value;
		var lengthSelect = document.getElementsByName("new_length")[0];
		var redLength = lengthSelect[lengthSelect.selectedIndex].value;
		var staleSelect = document.getElementsByName("stale_length")[0];
		var stale = staleSelect[staleSelect.selectedIndex].value;
		var questionSelect = document.getElementsByName("max_question")[0];
		var maxQuestion = questionSelect[questionSelect.selectedIndex].value;
		var responseSelect = document.getElementsByName("max_response")[0];
		var maxResponse = responseSelect[responseSelect.selectedIndex].value;
		var description = document.getElementById("instancedescriptioninput").value;
		var admin = Meteor.user().emails[0].address;
		var hiddenSelector = document.getElementsByName("visibility")[0];
		var isHidden = (hiddenSelector[hiddenSelector.selectedIndex].value == "hidden");
		var author = Meteor.user().profile.name;
		// Ensures that the table description is capitalized
		description = description.charAt(0).toUpperCase() + description.slice(1);
		// If the passwords don't match, alert the user
		/*if(password != passwordConfirm) {
			alert("Passwords do not match. Please try again.");
			return false;
		}*/
		var modsInput = document.getElementsByClassName("instancemodsinput");
		var mods = [];
		for(var m = 0; m < modsInput.length; m++) {
			if(modsInput[m].value) {
				mods.push(modsInput[m].value.trim());
			}
		}
		//console.log(mods);
		// Calls the 'create' function on the server to add Instance to the DB
		Meteor.call('create', tablename, threshhold, redLength, stale, description, mods,/*passwordConfirm,*/ admin, maxQuestion, maxResponse, anonymous, isHidden, author, function (error, result) {
			// If the result is an object, there was an error
			if(typeof result === 'object') {
				// Store an object of the error names and codes
				var errorCodes = {
					"tablename": "Please enter a valid table name using only letters and numbers.",
					"threshhold": "Please enter a valid # of 'featured' questions using the drop down menu.",
					"new_length": "Please enter a valid value using the 'new questions' drop down menu.",
					"stale_length": "Please enter a valid value using the 'old questions' drop down menu.",
					"description": "Please enter a valid description under 255 characters.",
					"modlength": "You have entered too many moderators. Please try again."/*,
					"password": "Please enter a valid password using letters, numbers, *, #, @, and between 4 and 10 characters."*/
				}
				// Alert the error
				showCreateError(errorCodes[result[0].name]);
				return false;
			} else {
				// Redirects to the newly-created table's list page
				Cookie.set('tablename', result);
				window.location.href = '/list';
			}
		});
	},
	"keypress #instancedescriptioninput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			document.getElementById("buttonarea").click();
		}
	},
	"keypress .instancemodsinput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			var last = document.getElementsByClassName("lastinputspacer")[0];
			var lastPlus = last.children[0].children[0];
			lastPlus.click();
			last = document.getElementsByClassName("lastinputspacer")[0];
			last.previousSibling.focus();
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

function showCreateError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementById("creatediv");
	var nextNode = document.getElementById("instancetopinputcontainer");
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
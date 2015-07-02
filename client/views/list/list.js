/*Meteor.setInterval( function () {
	// Sets Session variable "timeval" to current time in ms every 2 seconds
	Session.set("timeval", new Date().getTime());
}, 2000);*/

Template.list.onCreated(function () {
	// Initially sets the "timeval" Session variable to the current time
	Session.set("timeval", new Date().getTime());
	// Checks whether the user has a valid table cookie
	Meteor.call('listCookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			// If not, redirect back to the chooser page
			window.location.href = "/";
		}
	});
	// Calls server-side method to retrieve the current table
	Meteor.call('getTable', Cookie.get("tablename"), function(error, result) {
		// If successful, store table data in Session variables
		if(result) {
			Session.set("id", result._id);
			Session.set("tablename", result.tablename);
			Session.set("description", result.description);
			Session.set("threshhold", result.threshhold);
			Meteor.call('adminCheck', Cookie.get("admin_pw"), result.tablename, function(error, result) {
				Session.set("admin", result);
			});
			Session.set("stale_length", result.stale_length);
			Session.set("new_length", result.new_length);
		}
	});
});

Template.list.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Tool";
	// Checks whether the current user has admin privileges
	Meteor.call('adminCheck', Cookie.get("admin_pw"), Cookie.get("tablename"), function(error, result) {
		// If yes, enable draggable question divs
		if(result) {
			interact('.question')
			.draggable({
				// Divs have inertia and continue moving when mouse is released
				inertia: true,
				restrict: {
					restriction: "parent",
					endOnly: true,
					elementRect: { top: 0, left: 0, bottom: 0, right: 0 }
				},
				onmove: dragMoveListener,
				onend: function (event) {
					// When the question div is dropped, return to original position
					event.target.style.cssText = "-webkit-transform: translate(0px, 0px);z-index:0!important;";
		  			event.target.setAttribute('data-x', 0);
					event.target.setAttribute('data-y', 0);
				}
			});

			function dragMoveListener(event) {
				var target = event.target,
				x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
				y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
				// Translates the question div to the current mouse position
				target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
				// Sets the z-index to 99999 so the question div floats above others
				target.style.cssText += "z-index:99999!important;";
				target.style.backgroundColor = "#e3e3e3";
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
			}
			// Sets options for drop interaction
			interact('.question').dropzone({
				// Active when one .quesiton div is dropped on another
			  accept: '.question',
				// The two divs need over 75% overlapping for the drop to be registered
			  overlap: 0.4,
			  ondropactivate: function (event) {
			  },
			  ondragenter: function (event) {
				  event.target.style.backgroundColor = "#e3e3e3";
			  },
			  ondragleave: function (event) {
				  event.target.style.backgroundColor = "white";
			  },
			  // When dropped on top of another div, redirect to the /combine page
			  ondrop: function (event) {
				  var id1 = event.relatedTarget.id;
				  var id2 = event.target.id;
				  window.location.href="/combine/" + id1 + "/" + id2;
			  },
			  ondropdeactivate: function (event) {
			  }
			});
		}
	});
});

Template.list.helpers({
	// Sets the template tablename to the Session tablename variable
	tablename: function() {
		return Session.get("tablename");
	},
	// Sets the template id to the Session id variable
	id: function() {
		return Session.get("id");
	},
	// Sets the template description to the Session description variable
	description: function() {
		return Session.get("description");
	},
	// Sets the template admin boolean to the Session admin variable
	admin: function() {
		return Session.get("admin");
	},
	// Retrieves, orders, and modifies the questions for the chosen table
	question: function() {
		// Finds the questions from the Questions DB
		var questions = Questions.find({
			tablename: Session.get("tablename")
		}).fetch();
		var threshhold = Session.get("threshhold");
		var voteAverage = 0;
		var voteArray = [];
		// Finds the average # of votes and stores votes in an array
		for(var i = 0; i < questions.length; i++) {
			voteAverage += questions[i].votes;
			voteArray.push(questions[i].votes);
		}
		voteAverage /= questions.length;
		// Sorts the questions depending on # of votes (descending)
		questions.sort(function(a, b) {
			if(a.votes > b.votes) {
				return -1;
			} else if(a.votes < b.votes) {
				return 1;
			} else {
				return 0;
			}
		});
		// Loops through the retrieved questions and sets properties
		for(var i = 0; i < questions.length; i++) {
			if(questions[i].state != "disabled") {
				questions[i].admin = Session.get("admin");
				// Every other question goes in column #2
				questions[i].indexOne = (i % 2 == 0);
				// Sets the answer and modify links
				questions[i].answerlink = "/answer/" + questions[i]._id;
				questions[i].modifylink = "/modify/" + questions[i]._id;
				// Gets and formats the question date
				var d = new Date(questions[i].lasttouch);
				questions[i].f_time = getTime(d.toTimeString().substring(0,5)) + " " + d.toDateString().substring(4, 10);
				var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
				// Uses standard deviation to set the shade of the vote box
				var stddev = standardDeviation(voteArray) + .001;
				questions[i].shade = "c" + Math.round(3+((questions[i].votes - avg) / stddev));
				// Sets the age marker depending on how long since question last modified
				var staleDiff = (Session.get("timeval") - questions[i].lasttouch)/1000;
				var newDiff = (Session.get("timeval") - questions[i].timeorder)/1000;
				if(staleDiff > Session.get("stale_length")) {
					questions[i].age_marker = "stale";
				} else if(newDiff < Session.get("new_length")){
					questions[i].age_marker = "new";
				}
				// Finds the answers for the given question ID
				var answers = Answers.find({ 
					qid: questions[i]._id
				});
				if(answers.fetch().length > 0) {
					questions[i].answer = answers.fetch();
				}
				// If question is one of the first [threshhold] questions, it's "active"
				questions[i].popular = (i < threshhold);
			} else if(questions[i].state == "disabled"){
				// If the question is disabled, don't display
				questions[i].disabled = true;
			}
		}
		// Return the questions object to be displayed in the template
		return questions;
	}
});

Template.list.events({
	// When the vote button is clicked...
	"click .voteClick": function(event, template) {
		// Retrieves the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			var ip = result;
			if (error) {
				// If there's an error, alert it
				alert(error);
			} else {
				// Calls server-side "vote" method to update the Questions and Vote DBs
				Meteor.call('vote', event.currentTarget.id, ip, Session.get("tablename"), function(error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						var errorString = "";
						// Store an object of the error names and codes
						var errorCodes = {
							"lasttouch": "There was an error retrieving the time. Please return to the list and try again.",
							"votes": "There was an error incrementing the votes. Please return to the list and try again.",
							"qid": "There was an error with the question ID. Please return to the list and try again.",
							"ip": "There was an error with your IP address. Please return to the list and try again.",
							"tablename": "There was an error with the table name. Please return to the list and try again."
						}
						// Retrieves the different error messages
						for(var e = 0; e < result.length; e++) {
							errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
						}
						// Alerts the error if one exists
						alert(errorString);
					}
				});
			}
		});
	},
	// When the admin hide button is clicked...
	"click .hideQuestion": function(event, template) {	
		// Call the server-side hide method to hide the question
		Meteor.call('hide', event.currentTarget.id, function(error, result) {
			if(error) {
				// If an error exists, alert it
				alert(error);
			}
		});
	},
	// When the admin unhide button is clicked...
	"click #unhidebutton": function(event, template) {	
		// Call the server-side unhide method to unhide all questions
		Meteor.call('unhide', Session.get("tablename"), function (error, result) {
			if(error) {
				// If an error exists, alert it
				alert(error);
			}
		});
	},
	// When the admin logout button is clicked...
	"click #logoutbutton": function(event, template) {	
		// Removes the admin_pw cookie and refreshes the page
		Cookie.set("admin_pw", "");
		window.location.reload();
	}
});

// Helper function that caluclates a standard deviation given an array
// Source: http://derickbailey.com/
function standardDeviation(values){
	var avg = average(values);
	var squareDiffs = values.map(function(value){
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});
	var avgSquareDiff = average(squareDiffs);
	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
}
 
// Helper function that calculates the average given an array
function average(data){
	var sum = data.reduce(function(sum, value){
		return sum + value;
	}, 0);
	var avg = sum / data.length;
	return avg;
}

// Helper functiont that converts 24-hour time to 12-hour time with am/pm
function getTime(time) {
	var tmpArr = time.split(':'), time12;
	if(+tmpArr[0] == 12) {
		time12 = tmpArr[0] + ':' + tmpArr[1] + 'pm';
	} else {
		if(+tmpArr[0] == 00) {
			time12 = '12:' + tmpArr[1] + 'am';
		} else {
			if(+tmpArr[0] > 12) {
				time12 = (+tmpArr[0]-12) + ':' + tmpArr[1] + 'pm';
			} else {
				time12 = (+tmpArr[0]) + ':' + tmpArr[1] + 'am';
			}
		}
	}
	return time12;
}
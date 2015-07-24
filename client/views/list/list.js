/*Meteor.setInterval( function () {
	// Sets Session variable "timeval" to current time in ms every 2 seconds
	Session.set("timeval", new Date().getTime());
}, 1000);*/

Template.list.onCreated(function () {
	// Initially sets the "timeval" Session variable to the current time
	Session.set("responseName", "");
	Session.set("responseEmail", "");
	Session.set("timeval", new Date().getTime());
	Session.set("questionCount", 0);
	Session.set("replyCount", 0);
	Session.set("questionLimit", 250);
	Session.set("search", "all");
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
		console.log(result);
		if(result) {
			Session.set("id", result._id);
			Session.set("tablename", result.tablename);
			Session.set("description", result.description);
			Session.set("questionLength", result.max_question);
			Session.set("responseLength", result.max_response);
			Session.set("threshhold", result.threshhold);
			Session.set("mod", false);
			if(result.admin == Meteor.user().emails[0].address) {
				Session.set("admin", true);
				enableDragging();
			} else if(result.moderators.indexOf(Meteor.user().emails[0].address) > -1) {
				Session.set("mod", true);
				enableDragging();
			}
			Session.set("stale_length", result.stale_length);
			Session.set("new_length", result.new_length);
		}
	});
});

Template.list.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Tool";
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
	moderator: function() {
		return Session.get("mod");
	},
	// Retrieves, orders, and modifies the questions for the chosen table
	question: function() {
		// Finds the questions from the Questions DB
		if(Session.get("search") == "all") {
			var questions = Questions.find({
				tablename: Session.get("tablename")
			}).fetch();
		} else {
			var re = new RegExp(Session.get("search"), "i");
			var questions = Questions.find({
				tablename: Session.get("tablename"),
				"$or": [{
					text: {
						$regex: re
					}
				}, {
					poster: {
						$regex: re
					}
				}]
			}).fetch();
		}
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
				var urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
				questions[i].text = questions[i].text.replace(urlRegex, function(url) {
					if(url.charAt(url.length-1) == ")") {
						url = url.substring(0, url.length-1);
						var hasPeren = true;
					}
					if(url.indexOf("http://") == -1) {
						var fullURL = "http://" + url;
					} else {
						fullURL = url;
					}
					if(!hasPeren) {
						return '<a target="_blank" class="questionLink" href="' + fullURL + '">' + url + '</a>';
					} else {
						return '<a target="_blank" class="questionLink" href="' + fullURL + '">' + url + '</a>)';
					}
				});
				questions[i].adminButtons = (Session.get("admin") || Session.get("mod"));
				// Every other question goes in column #2
				if(i % 3 == 0) {
					questions[i].indexOne = true;
				} else if(i % 3 == 1) {
					questions[i].indexTwo = true;
				} else if(i % 3 == 2) {
					questions[i].indexThree = true;
				}
				// Sets the answer and modify links
				questions[i].answerlink = "/answer/" + questions[i]._id;
				questions[i].modifylink = "/modify/" + questions[i]._id;
				// Gets and formats the question date
				//var d = new Date(questions[i].lasttouch);
				//questions[i].f_time = getTime(d.toTimeString().substring(0,5)) + " " + d.toDateString().substring(4, 10);
				questions[i].f_time = timeSince(questions[i].lasttouch) + " Ago";
				var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
				// Uses standard deviation to set the shade of the vote box
				var stddev = standardDeviation(voteArray) + .001;
				questions[i].shade = "vc" + Math.round(3+((questions[i].votes - avg) / stddev));
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
					for(var a = 0; a < questions[i].answer.length; a++) {
						var urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
						questions[i].answer[a].text = questions[i].answer[a].text.replace(urlRegex, function(url) {
							if(url.charAt(url.length-1) == ")") {
								url = url.substring(0, url.length-1);
								var hasPeren = true;
							}
							if(url.indexOf("http://") == -1) {
								var fullURL = "http://" + url;
							} else {
								fullURL = url;
							}
							if(!hasPeren) {
								return '<a target="_blank" class="questionLink" href="' + fullURL + '">' + url + '</a>';
							} else {
								return '<a target="_blank" class="questionLink" href="' + fullURL + '">' + url + '</a>)';
							}
						});
					}
				}
				// If question is one of the first [threshhold] questions, it's "active"
				questions[i].popular = false;
				if(questions[i].votes == 1) {
					questions[i].votes = "1 vote";
				} else {
					questions[i].votes = questions[i].votes + " votes";
				}
			} else if(questions[i].state == "disabled"){
				// If the question is disabled, don't display
				questions[i].disabled = true;
			}
		}
		// Return the questions object to be displayed in the template
		return questions;
	},
	count: function() {
		return Session.get("questionCount");
	},
	replyCount: function() {
		return Session.get("replyCount");
	},
	questionLength: function() {
		if(Session.get("questionLength")) {
			return Session.get("questionLength");
		} else {
			return 350;
		}
	},
	responseLength: function() {
		if(Session.get("responseLength")) {
			return Session.get("responseLength");
		} else {
			return 150;
		}
	},
	responseName: function() {
		return Session.get("responseName");
	},
	responseEmail: function() {
		return Session.get("responseEmail");
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
		Meteor.call('hide', Meteor.user().emails[0].address, event.currentTarget.id, function(error, result) {
			if(error) {
				// If an error exists, alert it
				alert(error);
			}
		});
	},
	// When the admin unhide button is clicked...
	"click #unhidebutton": function(event, template) {	
		// Call the server-side unhide method to unhide all questions
		Meteor.call('unhide', Meteor.user().emails[0].address, Session.get("tablename"), function (error, result) {
			if(error) {
				// If an error exists, alert it
				alert(error);
			}
		});
	},
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', false, event.currentTarget.id, Meteor.user().emails[0].address, function(error, result) {
				if(error) {
					alert(error);
				} else {
					Router.go('/');
				}
			});
		}
	},
	"click #navAsk": function(event, template) {
		var questionDiv = document.getElementById("toparea");
		if(questionDiv.style.display == "none" || !questionDiv.style.display) { 
			$("#navAsk").html("Close");
			document.getElementById("navAsk").style.backgroundColor = "#ec4f4f";
			$("#toparea").slideDown();
		} else {
			$("#navAsk").html("+ Ask");
			document.getElementById("navAsk").style.backgroundColor = "#27ae60";
			$("#toparea").slideUp();
		}
	},
	"click .replybutton": function(event, template) {
		var theID = event.target.id.substring(5);
		var theArea = document.getElementById("down" + theID);
		//slideToggle("#down" + theID);
		if(theArea.style.display == "none" || !theArea.style.display) {
			//alert("reply" + theID);
			document.getElementById("reply" + theID).innerHTML = "Close";
			$("#down" + theID).slideDown(); 
		} else {
			document.getElementById("reply" + theID).innerHTML = "Reply";
			$("#down" + theID).slideUp();
		}
	},
	"click .replybottombutton": function(event, template) {
		// Retrieves data from form
		var theID = event.target.id;
		//var anonymous = document.getElementById("anonbox").checked;
		var answer = document.getElementById("text" + theID).value;
		var posterName = document.getElementById("name" + theID).value;
		var email = document.getElementById("email" + theID).value;
		var anonChecks = document.getElementsByClassName("anonchecked");
		for(var a = 0; a < anonChecks.length; a++) {
			if(anonChecks[a].id == theID) {
				var anonElement = anonChecks[a];
			}
		}
		if(anonElement.style.display) {
			var anonymous = (anonElement.style.display != "none");
		} else {
			var anonymous = false;
		}
		if(anonymous) {
			posterName = "Anonymous";
			email = "";
		}
		// Gets the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			if(error) {
				console.log(error);
			} else {
				// If a name isn't specified, call them "Anonymous"
				if(!posterName) {
					posterName = "Anonymous";
				}
				// Calls a server-side method to answer a question and update DBs
				Meteor.call('answer', Cookie.get("tablename"), answer, posterName, email, result, theID, function (error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						var errorString = "";
						// Store an object of the error names and codes
						var errorCodes = {
							"text": "Please enter a valid answer using less than 255 characters.",
							"poster": "Please enter a valid name using less than 30 characters",
							"email": "Please enter a valid email address.",
							"ip": "There was an error with your IP address. Try again.",
							"tablename": "There was an error with the table name. Try again.",
							"qid": "There was an error with the question ID."
						}
						for(var e = 0; e < result.length; e++) {
							errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
						}
						// Alert the error
						alert(errorString);
					} else {
						document.getElementById("reply" + theID).innerHTML = "Reply";
						$("#down" + theID).slideUp();
					}
				});
			}
		});
	},
	"keypress .replyemail": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			var theID = event.target.id.substring(5);
			var buttons = document.getElementsByClassName("replybottombutton");
			for(var b = 0; b < buttons.length; b++ ){
				if(buttons[b].id == theID) {
					buttons[b].click();
				}
			}
		}
	},
	"keyup .replyname": function(event, template) {
		Session.set("responseName", event.target.value);
	},
	"keyup .replyemail": function(event, template) {
		Session.set("responseEmail", event.target.value);
	},
	"keypress #questionemailinput": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			$("#buttonarea").click();
		}
	},
	"click .checkbox": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target.firstElementChild;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "savebox") {
				$("#bottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			checked.style.display = "none";
			if(event.target.id == "savebox") {
				$("#bottominputcontainer").slideUp();
			}
		}
	},
	"click .checked": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target;
		if(checked.style.display == "none" || !checked.style.display) {
			if(event.target.id == "savecheck") {
				$("#bottominputcontainer").slideDown();
			}
			checked.style.display = "block";
		} else {
			if(event.target.id == "savecheck") {
				$("#bottominputcontainer").slideUp();
			}
			checked.style.display = "none";
		}
	},
	"click #buttonarea": function(event, template) {
		// Retrieves data from the form
		var question = document.getElementById("questioninput").value;
		question = $("<p>").html(question).text();
		var anonElement = document.getElementById("anoncheck");
		if(anonElement.style.display) {
			var anonymous = (anonElement.style.display != "none");
		} else {
			var anonymous = false;
		}
		var posterName = document.getElementById("questionnameinput").value;
		var posterEmail = document.getElementById("questionemailinput").value;
		var password1 = document.getElementById("questionpasswordinput");
		var password2 = document.getElementById("questionconfirminput");
		if(password1 && password2) {
			password1 = password1.value;
			password2 = password2.value;
		}
		if(anonymous) {
			posterName = "Anonymous";
			posterEmail = "";
		}
		// Checks whether the question input is blank
		if(!question) {
			alert("Question cannot be left blank. Please try again.");
			return false;
		}
		// If the user entered a password, check the input
		if(password1 || password2) {
			if(password1 != password2) {
				alert("Your passwords don't match. Please try again");
				return false;
			} else if(!posterName) {
				alert("If you're creating an account, the name can't be left blank. Please try again.");
				return false;
			} else if(!posterEmail) {
				alert("If you're creating an account, the email can't be left blank. Please try again.");
				return false;
			} else {
				Accounts.createUser({
					email: posterEmail,
					password: password2,
					profile: {
						name: posterName
					}
				}, function(error) {
					if(error) {
						alert("Account creation failed. Please try again.");
					}
				})
				//Both passwords and input are a-okay
			}
		}
		// Calls server-side method to get the user's IP address
		Meteor.call('getIP', function (error, result) {
			if (error) {
				// If there's an error, alert the user
				alert(error);
				return false;
			} else {
				// Calls server-side "propose" method to add question to DB
				Meteor.call('propose', Cookie.get("tablename"), question, posterName, posterEmail, result, function (error, result) {
					// If returns an object, there was an error
					if(typeof result === 'object') {
						var errorString = "";
						// Store an object of the error names and codes
						var errorCodes = {
							"tablename": "Table name is invalid. Please return to the list and try again.",
							"text": "Please enter a valid question using less than 500 characters.",
							"poster": "Please enter a valid name using less than 30 characters.",
							"ip": "There was an error with your IP address. Please try again.",
							"timeorder": "There was an error retrieving the current time. Please try again.",
							"lasttouch": "There was an error retrieving the current time. Please try again.",
							"state": "Question state is invalid. Please return to the list and try again.",
							"votes": "# of votes is invalid. Please return to the list and try again.",
							"email": "Please enter a valid email address using less than 70 characters."
						}
						// Retrieve error descriptions
						for(var e = 0; e < result.length; e++) {
							errorString += "Error #" + (e + 1) + ": " + errorCodes[result[e].name] + "\n\n";
						}
						// Alert the error message
						alert(errorString);
					} else {
						// If successful, redirect back to the list page
						// Router.go("/list");
						$("#toparea").slideUp();
					}
				});
			}
		});
	},
	"keyup #searchbar": function(event, template) {
		if(event.target.value) {
			Session.set("search", event.target.value);
		} else {
			Session.set("search", "all");
		}
		//return Users.find({name: {$regex: re}});
	},
	"keyup #questioninput": function(event, template) {
		var urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
		var found = event.target.value.match(urlRegex);
		if(found) {
			var totalURL = 0;
			for(var f = 0; f < found.length; f++) {
				totalURL += found[f].length;
			}
			var total = (event.target.value.length - totalURL) + found.length;
			$("#questioninput").attr('maxlength', Number(Session.get("questionLength") + totalURL - found.length));
		} else {
			var total = event.target.value.length;
		}
		Session.set("questionCount", total);
	},
	"keyup .replyarea": function(event, template) {
		var urlRegex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
		var found = event.target.value.match(urlRegex);
		if(found) {
			var totalURL = 0;
			for(var f = 0; f < found.length; f++) {
				totalURL += found[f].length;
			}
			var total = (event.target.value.length - totalURL) + found.length;
			$(event.target).attr('maxlength', Number(Session.get("responseLength") + totalURL - found.length));
		} else {
			var total = event.target.value.length;
		}
		Session.set("replyCount", total);
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

// this is a fix for the jQuery slide effects
function slideToggle(el, bShow){
  var $el = $(el), height = $el.data("originalHeight"), visible = $el.is(":visible");
  
  // if the bShow isn't present, get the current visibility and reverse it
  if( arguments.length == 1 ) bShow = !visible;
  
  // if the current visiblilty is the same as the requested state, cancel
  if( bShow == visible ) return false;
  
  // get the original height
  if( !height ){
    // get original height
    height = $el.show().height();
    // update the height
    $el.data("originalHeight", height);
    // if the element was hidden, hide it again
    if( !visible ) $el.hide().css({height: 0});
  }

  // expand the knowledge (instead of slideDown/Up, use custom animation which applies fix)
  if( bShow ){
    $el.show().animate({height: height}, {duration: 250});
  } else {
    $el.animate({height: 0}, {duration: 250, complete:function (){
        $el.hide();
      }
    });
  }
}

function enableDragging() {
	Meteor.call('adminCheck', Meteor.user().emails[0].address, Cookie.get("tablename"), function(error, result) {
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
}
Meteor.setInterval( function () {
	// Sets Session variable "timeval" to current time in ms every 2 seconds
	Session.set("timeval", new Date().getTime());
}, 1000);

Template.list.onCreated(function () {
	Session.set("responseName", "");
	Session.set("responseEmail", "");
	Session.set("timeval", new Date().getTime());
	Session.set("questionCount", 0);
	Session.set("replyCount", 0);
	Session.set("questionLimit", 250);
	Session.set("search", "all");
	Session.set("tablename", Template.instance().data.tablename);
	Session.set("id", Template.instance().data._id);
	Session.set("slug", Template.instance().data.slug);
	Session.set("description",  Template.instance().data.description);
	if(typeof  Template.instance().data.anonymous !== 'undefined') {
		Session.set("anonymous",  Template.instance().data.anonymous);
	} else {
		Session.set("anonymous", true);
	}
	Session.set("questionLength",  Template.instance().data.max_question);
	Session.set("responseLength",  Template.instance().data.max_response);
	Session.set("threshhold",  Template.instance().data.threshhold);
	Session.set("mod", false);
	if(Meteor.user()) {
		if( Template.instance().data.admin == Meteor.user().emails[0].address) {
			Session.set("admin", true);
			enableDragging();
		} else if( Template.instance().data.moderators.indexOf(Meteor.user().emails[0].address) > -1) {
			Session.set("mod", true);
			enableDragging();
		}
	}
	Session.set("stale_length",  Template.instance().data.stale_length);
	Session.set("new_length",  Template.instance().data.new_length);
});

Template.list.onRendered(function() {
	// Sets the document title when the template is rendered
	document.title = "Live Question Answer Tool";
	$('#topinputcontainer').hide();
	$('head').append('<link rel="alternate" type="application/rss+xml" href="/rss/{{tablename}}"/>');
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
			//console.log(Session.get("tablename"));
			var questions = Questions.find({
				instanceid: Session.get("id")
			}).fetch();
		} else {
			var re = new RegExp(Session.get("search"), "i");
			var questions = Questions.find({
				instanceid: Session.get("id"),
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
		var maxVote = 0;
		var voteArray = [];
		// Finds the average # of votes and stores votes in an array
		for(var i = 0; i < questions.length; i++) {
			if(questions[i].votes > maxVote) {
				maxVote = questions[i].votes;
			}
			voteAverage += questions[i].votes;
			voteArray.push(questions[i].votes);
		}
		voteAverage /= questions.length;
		// Sorts the questions depending on # of votes (descending)
		questions.sort(function(a, b) {
			//console.log(((new Date().getTime() - a.lasttouch) / 60000).floor());
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
			if(questions[i].state != "disabled" || Session.get("admin") || Session.get("mod")) {
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
						return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
					} else {
						return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>)';
					}
				});
				questions[i].adminButtons = (Session.get("admin") || Session.get("mod"));
				// Sets the answer and modify links
				questions[i].answerlink = "/answer/" + questions[i]._id;
				questions[i].modifylink = "/modify/" + questions[i]._id;
				// Gets and formats the question date
				questions[i].f_time = timeSince(questions[i].timeorder) + " Ago";
				var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
				// Uses standard deviation to set the shade of the vote box
				var stddev = standardDeviation(voteArray) + .001;
				questions[i].shade = "vc" + Math.round(3+((questions[i].votes - avg) / stddev));
				// Sets the age marker depending on how long since question last modified
				var staleDiff = (Session.get("timeval") - questions[i].lasttouch)/1000;
				var newDiff = (Session.get("timeval") - questions[i].timeorder)/1000;
				if(staleDiff > Session.get("stale_length")) {
					questions[i].stale = true;
					questions[i].age_marker = "stalequestion";
				} else if(newDiff < Session.get("new_length")) {
					questions[i].new = true;
					questions[i].age_marker = "newquestion";
				}
				// Finds the answers for the given question ID
				var answers = Answers.find({ 
					qid: questions[i]._id
				});
				if(answers.fetch().length > 0) {
					if(answers.fetch().length > 3) {
						questions[i].hasHidden = true;
						questions[i].numberHidden = answers.fetch().length - 3;
						if(answers.fetch().length == 4) {
							questions[i].replyText = "reply";
						} else {
							questions[i].replyText = "replies";
						}
					}
					questions[i].answer = answers.fetch();
					for(var a = 0; a < questions[i].answer.length; a++) {
						if(a > 2) {
							questions[i].answer[a].isHidden = true;
						}
						questions[i].answer[a].text = questions[i].answer[a].text.replace(/\B(@\S+)/g, "<strong>$1</strong>");
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
								return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
							} else {
								return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>)';
							}
						});
					}
				}
				// If question is one of the first [threshhold] questions, it's "active"
				/*if(questions[i].votes == 1) {
					questions[i].votes = "1 vote";
				} else {
					questions[i].votes = questions[i].votes + " votes"; 
				}*/
				if(i < Session.get("threshhold")) {
					questions[i].popular = true;
				} else {
					questions[i].popular = false;
				}
			} else if(questions[i].state == "disabled") {
				// If the question is disabled, don't display
				//questions[i].disabled = true;
			}
		}
		questions.sort(function(a, b) {
			//console.log(((new Date().getTime() - a.lasttouch) / 60000).floor());
			var aDiff = Math.floor(((new Date().getTime() - a.timeorder) / 60000));
			var bDiff = Math.floor(((new Date().getTime() - b.timeorder) / 60000));
			var aIndex = a.votes;
			var bIndex = b.votes;
			if(aDiff < 5) {
				aIndex += (maxVote * (5 - aDiff));
			}
			if(bDiff < 5) {
				bIndex += (maxVote * (5 - bDiff));
			}
			if(a.popular) {
				aIndex += 999999999;
			}
			if(b.popular) {
				bIndex += 999999999;
			}
			if(aIndex > bIndex) {
				return -1;
			} else if(aIndex < bIndex) {
				return 1;
			} else {
				if(!a.answer) {
					var aAnswerLength = 0;
				} else {
					var aAnswerLength = a.answer.length;
				}
				if(!b.answer) {
					var bAnswerLength = 0;
				} else {
					var bAnswerLength = b.answer.length;
				}
				if(aAnswerLength > bAnswerLength) {
					return -1;
				} else if(aAnswerLength < bAnswerLength) {
					return 1;
				} else {
					return 0;
				}
			}
		});
		// Return the questions object to be displayed in the template
		return questions;
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
	"click .voteright": function(event, template) {
		// Retrieves the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			var ip = result;
			if (!error) {
				// Calls server-side "vote" method to update the Questions and Vote DBs
				Meteor.call('vote', event.currentTarget.id, ip, Session.get("id"), function(error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						// Store an object of the error names and codes
						var errorCodes = {
							"lasttouch": "There was an error retrieving the time. Please return to the list and try again.",
							"votes": "There was an error incrementing the votes. Please return to the list and try again.",
							"qid": "There was an error with the question ID. Please return to the list and try again.",
							"ip": "There was an error with your IP address. Please return to the list and try again.",
							"tablename": "There was an error with the table name. Please return to the list and try again."
						}
						// Alerts the error if one exists
						showProposeError(errorCodes[result[0].name]);
					}
				});
			}
		});
	},
	// When the admin hide button is clicked...
	"click .adminquestionhide": function(event, template) {	
		// Call the server-side hide method to hide the question
		if(Questions.findOne({ _id: event.currentTarget.id}).state === "disabled") {
			Meteor.call('unhideThis', event.currentTarget.id);
		}
		else {
			Meteor.call('hide', event.currentTarget.id);
		}
	},
	// When the admin unhide button is clicked...
	"click #unhidebutton": function(event, template) {	
		// Call the server-side unhide method to unhide all questions
		Meteor.call('unhide', Session.get("id"));
	},
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', event.currentTarget.id, function(error, result) {
				if(!error) {
					Router.go('/');
				}
			});
		}
	},
	"click #navAsk": function(event, template) {
		var parentNode = document.getElementById("header");
		dropDownTemplate = Blaze.render(Template.propose, parentNode);
		var questionDiv = document.getElementById("toparea");
		if(questionDiv.style.display == "none" || !questionDiv.style.display) { 
			$("#navAsk").html("Close");
			document.getElementById("navAsk").style.backgroundColor = "#ec4f4f";
			$("#toparea").slideDown();
			$('#questioninput').focus();
		} else {
			if(typeof currentError != "undefined") {
				Blaze.remove(currentError);
			}
			$("#navAsk").html("Post");
			document.getElementById("navAsk").style.backgroundColor = "#27ae60";
			$("#toparea").slideUp();
			if(typeof dropDownTemplate != "undefined") {
				Blaze.remove(dropDownTemplate);
			}
		}
	},
	"click .replybutton": function(event, template) {
		Session.set("replyCount", 0);
		$(".replybottom").slideUp();
		$(".replyarea").val("");
		$(".replybutton").html("Reply");
		var theID = event.target.id.substring(5);
		var theArea = document.getElementById("down" + theID);
		if(theArea.style.display == "none" || !theArea.style.display) {
			document.getElementById("reply" + theID).innerHTML = "Close";
			$("#down" + theID).slideDown(400, function() {
				$(this).css("display", "flex")
			}); 
			$('#text' + theID).focus();
		} else {
			if(typeof replyError != "undefined") {
				Blaze.remove(replyError);
			}
			document.getElementById("reply" + theID).innerHTML = "Reply";
			$("#down" + theID).slideUp();
		}
	},
	"click .checkbox": function(event, template) {
		var checked = event.target.firstElementChild;
		if(checked.style.display == "none" || !checked.style.display) {
			checked.style.display = "block";
			if(Meteor.user()) {
				$(".replyname").val("Anonymous");
				$(".replyemail").val("");
			}
		}
	},
	"click .checked": function(event, template) {
		//console.log(event);
		//return false;
		var checked = event.target;
		if(checked.style.display == "block") {
			if(Meteor.user()) {
				$(".replyname").val(Meteor.user().profile.name);
				$(".replyemail").val(Meteor.user().emails[0].address);
			}
			checked.style.display = "none";
		}
	},
	"click .replybottombutton": function(event, template) {
		// Retrieves data from form
		var theID = event.target.id;
		//var anonymous = document.getElementById("anonbox").checked;
		var answer = document.getElementById("text" + theID).value;
		var posterName = Meteor.user().profile.name;
		var email = Meteor.user().emails[0].address;
		// Gets the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			if(!error) {
				// If a name isn't specified, call them "Anonymous"
				if(!posterName) {
					posterName = "Anonymous";
				}
				// Calls a server-side method to answer a question and update DBs
				Meteor.call('answer', Session.get("id"), answer, posterName, email, result, theID, function (error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						// Store an object of the error names and codes
						var errorCodes = {
							"text": "Please enter an answer.",
							"poster": "Please enter a valid name.",
							"email": "Please enter a valid email address.",
							"ip": "There was an error with your IP address. Try again.",
							"instanceid": "There was an error with the instance id. Try again.",
							"qid": "There was an error with the question ID."
						}
						// Alert the error
						showReplyError(errorCodes[result[0].name], theID);
						return false;
					} else {
						if(typeof replyError != "undefined") {
							Blaze.remove(replyError);
						}
						document.getElementById("reply" + theID).innerHTML = "Reply";
						document.getElementById("text" + theID).value = "";
						$("#down" + theID).slideUp();
					}
				});
			}
		});
	},

	"click .anon-reply-bottom-button": function(event, template) {
		// Retrieves data from form
		var theID = event.target.id;
		//var anonymous = document.getElementById("anonbox").checked;
		var answer = document.getElementById("text" + theID).value;
		var posterName = "Anonymous";
		var email = "";
		if(!Session.get("anonymous")) {
			showReplyError("The admin has disabled anonymous posting.", theID);
			return false;
		}
		// Gets the user's IP address from the server
		Meteor.call('getIP', function (error, result) {
			if(!error) {
				// If a name isn't specified, call them "Anonymous"
				if(!posterName) {
					posterName = "Anonymous";
				}
				// Calls a server-side method to answer a question and update DBs
				Meteor.call('answer', Session.get("id"), answer, posterName, email, result, theID, function (error, result) {
					// If the result is an object, there was an error
					if(typeof result === 'object') {
						// Store an object of the error names and codes
						var errorCodes = {
							"text": "Please enter an answer.",
							"poster": "Please enter a valid name.",
							"email": "Please enter a valid email address.",
							"ip": "There was an error with your IP address. Try again.",
							"instanceid": "There was an error with the instance id. Try again.",
							"qid": "There was an error with the question ID."
						}
						// Alert the error
						showReplyError(errorCodes[result[0].name], theID);
						return false;
					} else {
						if(typeof replyError != "undefined") {
							Blaze.remove(replyError);
						}
						document.getElementById("reply" + theID).innerHTML = "Reply";
						document.getElementById("text" + theID).value = "";
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
			for(var b = 0; b < buttons.length; b++ ) {
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
	"keyup #searchbar": function(event, template) {
		if(event.target.value) {
			Session.set("search", event.target.value);
		} else {
			Session.set("search", "all");
		}
		//return Users.find({name: {$regex: re}});
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
	},
	"click .facebookbutton": function(event, template) {
		popupwindow("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.origin + "/list/" + Session.get("slug")), "Share Question Tool!", 600, 400);
	},
	"click .twitterbutton": function(event, template) {
		var questionDiv = event.target.parentElement.parentElement;
		var questionText = questionDiv.getElementsByClassName("questiontext")[0].innerHTML.trim();
		if(questionText.length > 35) {
			questionText = questionText.substring(0, 34);
		}
		var tweetText = 'Check out this question: "' + questionText + '..." on Question Tool by @berkmancenter ' + window.location.origin + "/list/" + Session.get("slug");
		popupwindow("https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetText), "Share Question Tool!", 600, 400);
	},
	"click #modbutton": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.add, parentNode);
	},
	"click #renamebutton": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.renderWithData(Template.rename, {
			id: Session.get("id"),
			tablename: Session.get("tablename"),
			isList: true
		}, parentNode);
	},
	"click .adminquestionmodify": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.renderWithData(Template.modify, event.currentTarget.id, parentNode);
	},
	"click #navPresent": function(event, template) {
		$("#banner").slideUp();
		$(".instancetitle").slideUp();
		$(".description").slideUp();
		$("#footercontainer").slideUp();
		$("#navUnPresent").fadeIn();
		$("#hiddenName").fadeIn();
		$(".admincontainer").slideUp();
	},
	"click #navUnPresent": function(event, template) {
		$("#banner").slideDown();
		$(".instancetitle").slideDown();
		$(".description").slideDown();
		$("#footercontainer").slideDown();
		$("#navUnPresent").fadeOut();
		$("#hiddenName").fadeOut();
		$(".admincontainer").slideDown();
	},
	"click .hiddenMessage": function(event, template) {
		$(event.currentTarget).prev().slideDown();
		event.currentTarget.style.display = "none";
		$(event.currentTarget).next().css("display", "block");
		/*var replyText = "replies";
		if(event.target.id == 1) {
			replyText = "reply";
		}
		$(event.currentTarget).html("Hide " + replyText + "...");
		$(event.currentTarget).attr('class', 'hiddenMessageHide');
		Tracker.flush();*/
	},
	"click .hiddenMessageHide": function(event, template) {
		$(event.currentTarget).prev().prev().slideUp();
		event.currentTarget.style.display = "none";
		$(event.currentTarget).prev().css("display", "block");
		/*var numberHidden = event.currentTarget.id;
		var replyText = "replies";
		if(numberHidden == 1) {
			replyText = "reply";
		}
		$(event.currentTarget).html("Show " + numberHidden + " {{numberHidden}} more " + replyText + "...");
		$(event.currentTarget).attr('class', 'hiddenMessage');
		Tracker.flush();*/
	}
});

function popupwindow(url, title, w, h) {
  var left = (screen.width/2)-(w/2);
  var top = (screen.height/2)-(h/2);
  return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
} 

// Helper function that caluclates a standard deviation given an array
// Source: http://derickbailey.com/
function standardDeviation(values) {
	var avg = average(values);
	var squareDiffs = values.map(function(value) {
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});
	var avgSquareDiff = average(squareDiffs);
	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
}
 
// Helper function that calculates the average given an array
function average(data) {
	var sum = data.reduce(function(sum, value) {
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

function enableDragging() {
	Meteor.call('adminCheck', Session.get("id"), function(error, result) {
		// If yes, enable draggable question divs
		if(result) {
			interact('.question')
			.ignoreFrom('textarea')
			.draggable({
				// Divs have inertia and continue moving when mouse is released
				inertia: true,
				restrict: {
					restriction: "#recent",
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
			  overlap: 0.2,
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
				  var parentNode = document.getElementById("banner");
				  Blaze.renderWithData(Template.combine, {
					  first: id1, 
					  second: id2
				  }, parentNode);
				  //window.location.href="/combine/" + id1 + "/" + id2;
			  },
			  ondropdeactivate: function (event) {
			  }
			});
		}
	});
}

function showProposeError(reason) {
	if(typeof currentError != "undefined") {
		Blaze.remove(currentError);
	}
	var parentNode = document.getElementById("questiondiv");
	var nextNode = document.getElementById("questioninput");
	currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

function showReplyError(reason, id) {
	if(typeof replyError != "undefined") {
		Blaze.remove(replyError);
	}
	var parentNode = document.getElementById("down" + id);
	var nextNode = document.getElementById("text" + id);
	replyError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}
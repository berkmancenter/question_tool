Meteor.setInterval( function () {
	Session.set("timeval", new Date().getTime());
}, 2000);

Template.list.onCreated(function () {
	Session.set("timeval", new Date().getTime());
	Meteor.call('listCookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		}
	});
	Meteor.call('getTable', Cookie.get("tablename"), function(error, result) {
		if(result) {
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
	document.title = "Live Question Tool";
	interact('.question')
	.draggable({
		inertia: true,
		restrict: {
			restriction: "parent",
			endOnly: true,
			elementRect: { top: 0, left: 0, bottom: 0, right: 0 }
		},
		onmove: dragMoveListener,
		onend: function (event) {
			console.log(event);
			event.target.style.cssText = "-webkit-transform: translate(0px, 0px);";
  			event.target.setAttribute('data-x', 0);
			event.target.setAttribute('data-y', 0);
		}
	});

	function dragMoveListener(event) {
		var target = event.target,
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}
	interact('.question').dropzone({
	  accept: '.question',
	  overlap: 0.75,
	  ondropactivate: function (event) {
	  },
	  ondragenter: function (event) {
	  },
	  ondragleave: function (event) {
	  },
	  ondrop: function (event) {
		  console.log(event.relatedTarget.innerText);
		  console.log(event.target.innerText);
		  console.log("Dropped");
	  },
	  ondropdeactivate: function (event) {
	  }
	});
});

Template.list.helpers({
	tablename: function() {
		return Session.get("tablename");
	},
	description: function() {
		return Session.get("description");
	},
	admin: function() {
		return Session.get("admin");
	},
	question: function() {
		var questions = Questions.find({
			tablename: Session.get("tablename")
		}).fetch();
		var threshhold = Session.get("threshhold");
		var voteAverage = 0;
		var voteArray = [];
		for(var i = 0; i < questions.length; i++) {
			voteAverage += questions[i].votes;
			voteArray.push(questions[i].votes);
		}
		voteAverage /= questions.length;
		questions.sort(function(a, b) {
			if(a.votes > b.votes) {
				return -1;
			} else if(a.votes < b.votes) {
				return 1;
			} else {
				return 0;
			}
		});
		for(var i = 0; i < questions.length; i++) {
			if(questions[i].state != "disabled") {
				questions[i].admin = Session.get("admin");
				questions[i].indexOne = (i % 2 == 0);
				questions[i].answerlink = "/answer/" + questions[i]._id;
				questions[i].modifylink = "/modify/" + questions[i]._id;
				var d = new Date(questions[i].lasttouch);
				questions[i].f_time = getTime(d.toTimeString().substring(0,5)) + " " + d.toDateString().substring(4, 10);
				var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
				var stddev = standardDeviation(voteArray) + .001;
				questions[i].shade = "c" + Math.round(3+((questions[i].votes - avg) / stddev));
				var staleDiff = (Session.get("timeval") - questions[i].lasttouch)/1000;
				var newDiff = (Session.get("timeval") - questions[i].timeorder)/1000;
				if(staleDiff > Session.get("stale_length")) {
					questions[i].age_marker = "stale";
				} else if(newDiff < Session.get("new_length")){
					questions[i].age_marker = "new";
				}
				var answers = Answers.find({ 
					qid: questions[i]._id
				});
				if(answers.fetch().length > 0) {
					questions[i].answer = answers.fetch();
				}
				questions[i].popular = (i < threshhold);
			} else if(questions[i].state == "disabled"){
				questions[i].disabled = true;
			}
		}
		return questions;
	}
});

Template.list.events({
	"click .voteClick": function(event, template) {
		Meteor.call('getIP', function (error, result) {
			var ip = result;
			if (error) {
				console.log(error);
			} else {
				Meteor.call('vote', event.currentTarget.id, ip, Session.get("tablename"), function(error, result) {
					if(typeof result === 'object') {
						var errorString = "";
						for(var e = 0; e < result.length; e++) {
							if(result[e].name == "lasttouch") {
								errorString += "Error #" + (e + 1) + " : There was an error retrieving the time. Please return to the list and try again.\n\n";
							} else if(result[e].name == "votes") {
								errorString += "Error #" + (e + 1) + " : There was an error incrementing the votes. Please return to the list and try again.\n\n";
							} else if(result[e].name == "qid") {
								errorString += "Error #" + (e + 1) + " : There was an error with the question ID. Please return to the list and try again.\n\n";
							} else if(result[e].name == "ip") {
								errorString += "Error #" + (e + 1) + " : There was an error with your IP address. Please return to the list and try again.\n\n";
							} else if(result[e].name == "tablename") {
								errorString += "Error #" + (e + 1) + " : There was an error with the table name. Please return to the list and try again.\n\n";
							}
						}
						alert(errorString);
					}
				});
			}
		});
	},
	"click .hideQuestion": function(event, template) {	
		Meteor.call('hide', event.currentTarget.id, function(error, result) {
			if(error) {
				alert(error);
			}
		});
	},
	"click #unhidebutton": function(event, template) {	
		Meteor.call('unhide', Session.get("tablename"), function (error, result) {
			if(error) {
				alert(error);
			}
		});
	},
	"click #logoutbutton": function(event, template) {	
		Cookie.set("admin_pw", "");
		window.location.reload();
	}
});

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
 
function average(data){
	var sum = data.reduce(function(sum, value){
		return sum + value;
	}, 0);
	var avg = sum / data.length;
	return avg;
}

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
Template.list.helpers({
	tablename: function() {
		return Cookie.get("tablename");
	},
	description: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		return table.description;
	},
	question: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		var threshhold = table.threshhold;
		var password = table.password;
		var isAdmin = false;
		console.log(Cookie.get("admin_pw"));
		console.log(password);
		if((Cookie.get("admin_pw") == password)) {
			if(Cookie.get("admin_pw") != null && password != null) {
				isAdmin = true;
			}
		}
		var questions = Questions.find({ tablename: Cookie.get("tablename") }).fetch();
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
				questions[i].admin = isAdmin;
				if(i%2 == 0) {
					questions[i].indexOne = true;
					questions[i].indexTwo = false;
				} else {
					questions[i].indexOne = false;
					questions[i].indexTwo = true;
				}
				questions[i].answerlink = "/answer/" + questions[i]._id;
				questions[i].disablelink = "/disable/" + questions[i]._id;
				questions[i].modifylink = "/modify/" + questions[i]._id;
				var d = new Date(questions[i].lasttouch);
				var time24 = d.toTimeString().substring(0,5);
				var tmpArr = time24.split(':'), time12;
				if(+tmpArr[0] == 12) {
					time12 = tmpArr[0] + ':' + tmpArr[1] + ' pm';
				} else {
					if(+tmpArr[0] == 00) {
						time12 = '12:' + tmpArr[1] + ' am';
					} else {
						if(+tmpArr[0] > 12) {
							time12 = (+tmpArr[0]-12) + ':' + tmpArr[1] + ' pm';
						} else {
							time12 = (+tmpArr[0]) + ':' + tmpArr[1] + ' am';
						}
					}
				}
				questions[i].f_time = time12 + " " + d.toTimeString().substring(19,22) + " " + d.toDateString().substring(4, 10);
				var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
				var stddev = (Math.max.apply(Math, voteArray)-Math.min.apply(Math, voteArray))/6;
				stddev += .001;
				questions[i].shade = "c" + Math.round(3+((questions[i].votes - avg) / stddev));
				questions[i].age_marker = "stale";
				var answers = Answers.find({ qid: questions[i]._id });
				if(answers.fetch().length > 0) {
					questions[i].answer = answers.fetch();
				}
				if(i < threshhold) {
					questions[i].popular = true;
				} else {
					questions[i].popular = false;
				}
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
				var votes = Votes.find({
					qid: event.currentTarget.id,
					ip: ip
				});
				if(votes.fetch().length == 0) {
					Questions.update({
						_id: event.currentTarget.id
					}, {
						$set: {lasttouch: new Date().getTime()},
						$inc: {votes: 1}
					}, function(error, count, status) {
						if(error) {
							console.log(error);
						} else {
							Votes.insert({
								qid: event.currentTarget.id, 
								ip: ip, 
								tablename: Cookie.get('tablename'),
							}, function(error, id) {
								if(error) {
									console.log(error);
								} else {
								}
							});
						}				
					});
				}
			}
		});
	},
	"click .hideQuestion": function(event, template) {	
		Questions.update({
			_id: event.currentTarget.id
		}, {
			$set: {
				state: "disabled"
			}
		}, function(error, count, status) {
			if(error) {
				console.log(error);
			}
		});
	}
})

Template.list.helpers({
	tablename: function() {
		return Cookie.get("tablename");
	},
	description: "Here's a test description",
	popular: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		var threshhold = table.threshhold;
		Session.set("threshhold", threshhold);
		var popQuestions = Questions.find({ tablename: Cookie.get("tablename")});
		popQuestions = popQuestions.fetch();
		popQuestions.sort(function(a, b) {
			if(a.votes > b.votes) {
				return -1;
			} else if(a.votes < b.votes) {
				return 1;
			} else {
				return 0;
			}
		});
		var voteAverage = 0;
		var voteArray = [];
		for(var i = 0; i < popQuestions.length; i++) {
			voteAverage += popQuestions[i].votes;
			voteArray.push(popQuestions[i].votes);
		}
		var popular = [];
		for(var p = 0; p < threshhold; p++) {
			popular.push(new Array());
			popular[p].admin = false;
			popular[p].votes = popQuestions[p].votes;
			popular[p].text = popQuestions[p].text;
			popular[p].poster = popQuestions[p].poster;
			popular[p].email = popQuestions[p].email;
			if(p%2 == 0) {
				popular[p].indexOne = true;
				popular[p].indexTwo = false;
			} else if(p%2 == 1) {
				popular[p].indexOne = false;
				popular[p].indexTwo = true;
			}
			popular[p].answerlink = "/answer/" + popQuestions[p]._id;
			var d = new Date(popQuestions[p].lasttouch);
			popular[p].f_time = d.toTimeString().substring(0,5) + " " + d.toTimeString().substring(19,22) + " " + d.toDateString().substring(4, 10);
			var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
			var stddev = (Math.max.apply(Math, voteArray)-Math.min.apply(Math, voteArray))/6;
			popular[p].shade = "c" + Math.round(3+((popQuestions[p].votes - avg) / stddev));
			popular[p].age_marker = "stale";
			var answers = Answers.find({ qid: popQuestions[p]._id });
			if(answers.fetch().length > 0) {
				popular[p].answer = answers.fetch();
			}
		}
		return popular;
	},
	recent: function() {
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
		for(var i = (Session.get("threshhold")); i < questions.length; i++) {
			questions[i].admin = false;
			if(i%2 == 0) {
				questions[i].indexOne = true;
				questions[i].indexTwo = false;
			} else {
				questions[i].indexOne = false;
				questions[i].indexTwo = true;
			}
			questions[i].answerlink = "/answer/" + questions[i]._id;
			var d = new Date(questions[i].lasttouch);
			questions[i].f_time = d.toTimeString().substring(0,5) + " " + d.toTimeString().substring(19,22) + " " + d.toDateString().substring(4, 10);
			var avg = (Math.max.apply(Math, voteArray) + Math.min.apply(Math, voteArray)) / 2;
			var stddev = (Math.max.apply(Math, voteArray)-Math.min.apply(Math, voteArray))/6;
			questions[i].shade = "c" + Math.round(3+((questions[i].votes - avg) / stddev));
			questions[i].age_marker = "stale";
			var answers = Answers.find({ qid: questions[i]._id });
			if(answers.fetch().length > 0) {
				questions[i].answer = answers.fetch();
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
				if(votes.fetch().length != 0) {
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
	}
})

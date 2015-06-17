if (Meteor.isClient) { 
	
	Template.list.helpers({
		tablename: function() {
			return Cookie.get("tablename");
		},
		description: "Here's a test description",
		popular: function() {
			var questions = Questions.find({ tablename: Cookie.get("tablename") }).fetch();
			var voteAverage = 0;
			var voteArray = [];
			for(var i = 0; i < questions.length; i++) {
				voteAverage += questions[i].votes;
				voteArray.push(questions[i].votes);
			}
			voteAverage /= questions.length;
			for(var i = 0; i < questions.length; i++) {
				questions[i].admin = false;
				questions[i].indexOne = true;
				questions[i].posterGreaterThanZero = true;
				questions[i].emailGreaterThanZero = true;
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
			questions.sort(function(a, b) {
				if(a.votes > b.votes) {
					return -1;
				} else if(a.votes < b.votes) {
					return 1;
				} else {
					return 0;
				}
			});
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
}
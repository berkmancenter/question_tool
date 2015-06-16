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
				var d = new Date(questions[i].lasttouch);
  				questions[i].f_time = d.toTimeString().substring(0,5) + " " + d.toTimeString().substring(19,22) + " " + d.toDateString().substring(4, 10);
  				questions[i].shade = "c" + Math.round(3+(Math.max.apply(Math, voteArray)-Math.min.apply(Math, voteArray))/6);
  				questions[i].age_marker = "stale";
  			}
  			return questions;
		}
	});
	
}
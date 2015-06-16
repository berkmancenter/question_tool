if (Meteor.isClient) { 
	
	Template.list.helpers({
		tablename: function() {
			return Cookie.get("tablename");
		},
		description: "Here's a test description",
		popular: function() {
			var stddev;
			var questions = Questions.find({ tablename: Cookie.get("tablename") }).fetch();
			var voteAverage = 0;
			var voteArray = [];
			for(var i = 0; i < questions.length; i++) {
				voteAverage += questions[i].votes;
				voteArray.push(questions[i].votes);
			}
			voteAverage /= questions.length;
			Meteor.call('stdDev', voteArray, function (error, result) {
			  if (error) {
				  console.log(error);
			  } else {
	  			  stddev = result;
			  }
			});
  			for(var i = 0; i < questions.length; i++) {
  				questions[i].admin = false;
  				questions[i].indexOne = true;
  				questions[i].posterGreaterThanZero = true;
  				questions[i].emailGreaterThanZero = true;
  				questions[i].f_time = "monday the 25th";
  				questions[i].shade = "c" + Math.round(3+((questions[i].votes - voteAverage)/3));
  				questions[i].age_marker = "stale";
  			}
  			return questions;
		}
	});
	
}
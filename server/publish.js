// Only publishes to the user the instances that have been updated within 30 days
Meteor.publish('instances', function(table) {
  return Instances.find({
	  // UNCOMMENT THIS WHEN PRODUCTION READY
	  /*lasttouch: {
		  $gt: (new Date().getTime() - 2592000000)
	  }*/
  });
});

// Only publishes to the user the questions that are associated with the selected table and are not disabled
Meteor.publish('questions', function(table) {
	return Questions.find({
		tablename: table,
		state: { 
			$ne : 'disabled' 
		}
	});
});

// Only publishes to the user the answers that are associated with the selected table
Meteor.publish('answers', function(table) {
  return Answers.find({
	  tablename: table
  });
});

// Only publishes to the user the votes that are associated with the selected table
Meteor.publish('votes', function(table) {
  return Votes.find({
	  tablename: table
  });
});
// Only publishes to the user the instances that have been updated within 30 days
Meteor.publish('instances', function() {
	return Instances.find({
		hidden: {
			$ne: true
		} 
	});
});

// Only publishes to the user the questions that are associated with the selected table and are not disabled
Meteor.publish('questions', function(table) {
	return Questions.find({
		tablename: { 
			$regex: new RegExp("^" + table, "i") 
		},
		state: { 
			$ne : 'disabled' 
		}
	});
});

// Only publishes to the user the answers that are associated with the selected table
Meteor.publish('answers', function(table) {
	return Answers.find({
		tablename: { 
			$regex: new RegExp("^" + table, "i") 
		}
	});
});

// Only publishes to the user the votes that are associated with the selected table
Meteor.publish('votes', function(table) {
	return Votes.find({
		tablename: { 
			$regex: new RegExp("^" + table, "i") 
		}
	});
});
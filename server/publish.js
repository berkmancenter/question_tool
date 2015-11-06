// Only publishes to the user the instances that have been updated within 30 days
Meteor.publish('instances', function() {
	var time = (new Date().getTime() - 2592000000);
	return Instances.find({
		hidden: {
			$ne: true
		},
		lasttouch: {
			$gt: time
		}
	});
});

// Only publishes to the user the questions that are associated with the selected table and are not disabled
Meteor.publish('questions', function(instanceid) {
	return Questions.find({
		instanceid: instanceid,
		state: { 
			$ne : 'disabled' 
		}
	});
});

// Only publishes to the user the answers that are associated with the selected table
Meteor.publish('answers', function(instanceid) {
	return Answers.find({
		instanceid: instanceid
	});
});

// Only publishes to the user the votes that are associated with the selected table
Meteor.publish('votes', function(instanceid) {
	return Votes.find({
		instanceid: instanceid
	});
});
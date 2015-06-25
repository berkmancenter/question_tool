Meteor.publish('instances', function(table) {
  return Instances.find({
	  /*lasttouch: {
		  $gt: (new Date().getTime() - 2592000000)
	  }*/
  });
});

Meteor.publish('questions', function(table) {
  return Questions.find({
	  tablename: table,
	  state: { 
		  $ne : 'disabled' 
	  }
	});
});

Meteor.publish('answers', function(table) {
  return Answers.find({
	  tablename: table
  });
});

Meteor.publish('votes', function(table) {
  return Votes.find({
	  tablename: table
  });
});
Meteor.publish('instances', function(table) {
  return Instances.find();
});

Meteor.publish('questions', function(table) {
  return Questions.find({tablename: table});
});

Meteor.publish('answers', function(table) {
  return Answers.find({tablename: table});
});

Meteor.publish('votes', function(table) {
  return Votes.find({tablename: table});
});
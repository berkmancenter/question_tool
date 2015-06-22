Tracker.autorun(function() {
	Meteor.subscribe('instances');
	Meteor.subscribe('questions', Cookie.get("tablename"));
	Meteor.subscribe('answers', Cookie.get("tablename"));
	Meteor.subscribe('votes', Cookie.get("tablename"));
});
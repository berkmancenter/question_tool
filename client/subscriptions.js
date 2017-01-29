// Ensures that the subscriptions to the Mongo collections
// depend on the current table cookie
Tracker.autorun(() => {
  Meteor.subscribe('instances');
});

SyncedCron.add({
  name: 'EMail Administrator when 30 Day Deletion is Approaching',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 1 day');
  },
  job: function() {
    var today = new Date();
    var thirtyDaysAgo = new Date(today.getTime() - 30*24*60*60*1000);
    var oldInstances = Instances.find({ lasttouch: { $lt: +thirtyDaysAgo } } ).fetch();
    for(var i = 0; i < oldInstances.length; i++) {
    	Email.send({
    		to: oldInstances[i].admin,
    		from: Meteor.users.findOne().emails[0].address,
    		subject: 'Action Required: Your Question Tool Instance is Going to Expire Soon',
    		text: 'Your instance on the Question Tool is about to expire. You can prevent this from happening by clicking the following link ' + Meteor.absoluteUrl() + 'list/' + oldInstances[i].slug + '/touch'
    	});
    }
  }
});
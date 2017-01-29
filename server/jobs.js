SyncedCron.add({
  name: 'E-mail Administrator when 30 Day Deletion is Approaching',
  schedule(parser) {
    // parser is a later.parse object
    return parser.text('every 1 day');
  },
  job() {
    const twentyNineDaysAgo = new Date(new Date().getTime() - 29 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    const oldInstances = Instances.find({ lasttouch: { $lt: +twentyNineDaysAgo, $gt: +thirtyDaysAgo } }).fetch();
    for (let i = 0; i < oldInstances.length; i++) {
      Email.send({
        to: oldInstances[i].admin,
        from: Meteor.users.findOne().emails[0].address,
        subject: 'Action Required: Your Question Tool Instance is Going to Expire Soon',
        text: 'Your instance on the Question Tool is about to expire. You can prevent this from happening by clicking the following link ' + Meteor.absoluteUrl() + 'list/' + oldInstances[i].slug + '/touch',
      });
    }
  },
});

Meteor.startup(() => {
  // Email of Question Tool super admin. Has control over Instances, etc.
  process.env.SUPERADMIN_EMAIL = 'questiontool@admin.com';
  // URL of mail server goes here for email sending
  process.env.MAIL_URL = 'smtp://postmaster@sandboxe9a1ef1673a844f49f36c196cae13407.mailgun.org:21dc5d60b4f6816743779c3ce317067f-8889127d-ed0e18f5@smtp.mailgun.org:587';
  							//'smtp://user:password@mailhost:port/'

  // Accounts.urls.resetPassword = function(token) {
  //   return Meteor.absoluteUrl('reset-password/' + token);
  // };

  SyncedCron.start();
});

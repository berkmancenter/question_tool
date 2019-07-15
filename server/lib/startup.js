Meteor.startup(() => {
  // Email of Question Tool super admin. Has control over Instances, etc.
  process.env.SUPERADMIN_EMAIL = 'questiontool@admin.com';

  SyncedCron.start();

  // Update to the reset password URL generated automatically, by removing the hashtag that was earlier appended by default
  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl('reset-password/' + token);
  };
});

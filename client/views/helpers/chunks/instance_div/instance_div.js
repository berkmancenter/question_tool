Template.instance_div.helpers({
  superadmin() {
    return Session.get('superadmin');
  },
  time_format(lasttouch) {
    return moment(lasttouch).fromNow(true);
  },
  strip_desc(description) {
    return jQuery('<p>' + description + '</p>').text();
  },
  date_format(lasttouch) {
    return moment(lasttouch).format('LLL');
  },
});

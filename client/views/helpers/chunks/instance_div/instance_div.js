Template.instance_div.helpers ({
	superadmin: function() {
		return Session.get("superadmin");
	},
	time_format: function(lasttouch){
		return moment(lasttouch).fromNow(true);
	},
	strip_desc: function(description){
		return jQuery('<p>' + description + '</p>').text();
	},
	date_format: function(lasttouch){
		return moment(lasttouch).format('LLL');
	}
});
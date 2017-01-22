Template.instance_div.helpers ({
	superadmin: function() {
		return Session.get("superadmin");
	},
	time_format: function(lasttouch){
		return moment(lasttouch).fromNow(true);
	},
	date_format: function(lasttouch){
		return moment(lasttouch).format('LLL');
	}
});
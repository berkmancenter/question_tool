Meteor.methods({
	getIP: function () {
		return this.connection.clientAddress;
	},
	cookieCheck: function() {
		//check whether current user has the proper cookies
	}
});
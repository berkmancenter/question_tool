Meteor.methods({
	getIP: function () {
		return this.connection.clientAddress;
	}
});
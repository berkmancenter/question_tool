if (Meteor.isClient) {

	Template.list.helpers({
		tablename: function() {
			return Cookie.get("tablename");
		},
		description: "Here's a test description",
		admin: false,
		popular: [{indexOne: true, votes: 6, f_time: "11:43 am EDT, 22 May", posterGreaterThanZero: true, shade: "c6", age_marker: "stale", notAdmin: true, emailGreaterThanZero: true, email: "nrubin999@gmail.com", poster: "Nick Rubin", text: "What's up my man?"}]
	});

}
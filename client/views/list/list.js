if (Meteor.isClient) { 
	
	Template.list.helpers({
		tablename: function() {
			return Cookie.get("tablename");
		},
		description: "Here's a test description",
		admin: false,
		indexOne: true,
		emailGreaterThanZero: true,
		posterGreaterThanZero:true,
		popular: function() {
			return Questions.find({ tablename: Cookie.get("tablename") });
		}
	});
	
}
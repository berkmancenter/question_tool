Template.login.helpers({
	tablename: Cookie.get("tablename"),
	description: function() {
		var table = Instances.findOne({ tablename: Cookie.get("tablename")});
		return table.description;
	}
});
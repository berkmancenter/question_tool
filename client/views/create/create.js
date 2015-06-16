if (Meteor.isClient) {

	Template.create.helpers({
		message: "Instances are deleted after 30 days",
		description: "Here's the default description"
	});
	
	Template.create.events({
		"click #submitbutton": function(event, template) {
			var tableName = document.getElementsByName("tablename")[0].value;
			var password = document.getElementsByName("pword1")[0].value;
			var passwordConfirm = document.getElementsByName("pword2")[0].value;
			var refreshSelect = document.getElementsByName("refresh_time")[0];
			var refresh = refreshSelect[refreshSelect.selectedIndex].value;
			var threshholdSelect = document.getElementsByName("threshold")[0];
			var threshhold = threshholdSelect[threshholdSelect.selectedIndex].value;
			var lengthSelect = document.getElementsByName("new_length")[0];
			var redLength = lengthSelect[lengthSelect.selectedIndex].value;
			var staleSelect = document.getElementsByName("stale_length")[0];
			var stale = staleSelect[staleSelect.selectedIndex].value;
			var description = document.getElementsByName("description")[0].value;
			Instances.insert({
				tablename: tableName,
				refresh_time: refresh,
				threshhold: threshhold,
				new_length: redLength,
				state_length: stale, 
				description: description,
				password: passwordConfirm,
			}, function(error, id) {
				Questions.insert({
					tablename: tableName,
					text: "Welcome to the live question tool. Feel free to post questions. Vote by clicking on the votes box.",
					poster: "the system",
					timeorder: new Date().getTime(),
					lasttouch: new Date().getTime(),
					state: "normal",
					votes: 0,
				}, function(error, id) {
					Cookie.set('tablename', tableName);
					window.location.href = 'http://localhost:3000/list';
				});
			});
		}
	});

}
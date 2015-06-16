Template.propose.events({
	"click #submitbutton": function(event, template) {
		var question = document.getElementsByName("comment")[0].value;
		var posterName = document.getElementsByName("poster")[0].value;
		var posterEmail = document.getElementsByName("email")[0].value;
		Meteor.call('getIP', function (error, result) {
			if (error) {
				console.log(error);
			} else {
				Questions.insert({
					tablename: Cookie.get('tablename'),
					text: question,
					poster: posterName,
					email: posterEmail,
					ip: result,
					timeorder: new Date().getTime(),
					lasttouch: new Date().getTime(),
					state: "normal",
					votes: 0
				}, function(error, id) {
					window.location.href = '/list';
				});
			}
		});
	}
});

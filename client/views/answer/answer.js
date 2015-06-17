Template.answer.events({
	"click #submitbutton": function(event, template) {
		var answer = document.getElementsByName("comment")[0].value;
		var posterName = document.getElementsByName("poster")[0].value;
		var email = document.getElementsByName("email")[0].value;
		var currentURL = window.location.href;
		currentURL = currentURL.split('/');
		currentURL = currentURL[currentURL.length - 1];
		Meteor.call('getIP', function (error, result) {
			if(error) {
				console.log(error);
			} else {
				Answers.insert({
					text: answer,
					poster: posterName,
					email: email,
					ip: result,
					tablename: Cookie.get('tablename'),
					qid: currentURL
				}, function(error, id) {
					window.location.href = '/list';
				});
			}
		});
	}
});
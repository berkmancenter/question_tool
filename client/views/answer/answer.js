Template.answer.onCreated(function () {
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		}
	});
});

Template.answer.onRendered(function() {
	document.title = "Live Question Tool Answer Form";
});

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
				Meteor.call('answer', Cookie.get("tablename"), answer, posterName, email, result, currentURL, function (error, result) {
					if(!error) {
						window.location.href = '/list';
					}
				});
			}
		});
	},
	"keypress #emailbox": function(e, template) {
		e.which = e.which || e.keyCode;
		if(e.which == 13) {
			e.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
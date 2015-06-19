Template.propose.onCreated(function () {
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		}
	});
});

Template.propose.events({
	"click #submitbutton": function(event, template) {
		var question = document.getElementsByName("comment")[0].value;
		var posterName = document.getElementsByName("poster")[0].value;
		var posterEmail = document.getElementsByName("email")[0].value;
		Meteor.call('getIP', function (error, result) {
			if (error) {
				console.log(error);
			} else {
				Meteor.call('propose', Cookie.get("tablename"), question, posterName, posterEmail, result, function (error, result) {
					if(!result) {
						window.location.href = "/list";
					}
				});
			}
		});
	},
	"keypress #emailbox": function(e, template) {
		e.which = e.which || e.keyCode;
		console.log(e.which);
		if(e.which == 13) {
			e.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});

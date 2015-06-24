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
					if(typeof result === 'object') {
						var errorString = "";
						for(var e = 0; e < result.length; e++) {
							if(result[e].name == "text") {
								errorString += "Error #" + (e + 1) + " : Please enter a valid answer using less than 255 characters.\n\n";
							} else if(result[e].name == "poster") {
								errorString += "Error #" + (e + 1) + " : Please enter a valid name using less than 30 characters.\n\n";
							} else if(result[e].name == "email") {
								errorString += "Error #" + (e + 1) + " : Please enter a valid email address.\n\n";
							} else if(result[e].name == "ip") {
								errorString += "Error #" + (e + 1) + " : There was an error with your IP address.\n\n";
							} else if(result[e].name == "tablename") {
								errorString += "Error #" + (e + 1) + " : There was an error with the table name.\n\n";
							} else if(result[e].name == "qid") {
								errorString += "Error #" + (e + 1) + " : There was an error with the QID.\n\n";
							}
						}
						alert(errorString);
					} else {
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
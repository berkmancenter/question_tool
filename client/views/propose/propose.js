Template.propose.onCreated(function () {
	Meteor.call('cookieCheck', Cookie.get("tablename"), function (error, result) {
		if(!result) {
			window.location.href = "/";
		}
	});
});

Template.propose.onRendered(function() {
	document.title = "Live Question Tool Proposal Form";
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
				Meteor.call('propose', Cookie.get("tablename"), question, posterName, 
					posterEmail, result, function (error, result) {
						if(typeof result === 'object') {
							var errorString = "";
							for(var e = 0; e < result.length; e++) {
								if(result[e].name == "tablename") {
									errorString += "Error #" + (e + 1) + " : Table name is invalid. Please return to the list and try again.\n\n";
								} else if(result[e].name == "text") {
									errorString += "Error #" + (e + 1) + " : Please enter a valid question using less than 255 characters.\n\n";
								} else if(result[e].name == "poster") {
									errorString += "Error #" + (e + 1) + " : Please enter a valid name using less than 30 characters.\n\n";
								} else if(result[e].name == "ip") {
									errorString += "Error #" + (e + 1) + " : There was an error with your IP address.\n\n";
								} else if(result[e].name == "timeorder") {
									errorString += "Error #" + (e + 1) + " : There was an error retrieving the current time.\n\n";
								} else if(result[e].name == "lasttouch") {
									errorString += "Error #" + (e + 1) + " : There was an error retrieving the current time.\n\n";
								} else if(result[e].name == "state") {
									errorString += "Error #" + (e + 1) + " : Question state is invalid. Pleae return to the list and try again.\n\n";
								} else if(result[e].name == "votes") {
									errorString += "Error #" + (e + 1) + " : # of votes is invalid. Please return to the list and try again.\n\n";
								} else if(result[e].name == "email") {
									errorString += "Error #" + (e + 1) + " : Please enter a valid email address using less than 70 characters.\n\n";
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

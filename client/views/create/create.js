Template.create.events({
	"click #submitbutton": function(event, template) {
		var tablename = document.getElementsByName("tablename")[0].value;
		var password = document.getElementsByName("pword1")[0].value;
		var passwordConfirm = document.getElementsByName("pword2")[0].value;
		var threshholdSelect = document.getElementsByName("threshold")[0];
		var threshhold = threshholdSelect[threshholdSelect.selectedIndex].value;
		var lengthSelect = document.getElementsByName("new_length")[0];
		var redLength = lengthSelect[lengthSelect.selectedIndex].value;
		var staleSelect = document.getElementsByName("stale_length")[0];
		var stale = staleSelect[staleSelect.selectedIndex].value;
		var description = document.getElementsByName("description")[0].value;
		Meteor.call('create', tablename, threshhold, redLength, stale, description, passwordConfirm, function (error, result) {
			if(typeof result === 'object') {
				var errorString = "";
				for(var e = 0; e < result.length; e++) {
					if(result[e].name == "tablename") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid table name using only letters and numbers.\n\n";
					} else if(result[e].name == "threshhold") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid # of 'featured' questions using the drop down menu.\n\n";
					} else if(result[e].name == "new_length") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid value using the 'new questions' drop down menu.\n\n";
					} else if(result[e].name == "stale_length") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid value using the 'old questions' drop down menu.\n\n";
					} else if(result[e].name == "description") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid description under 255 characters.\n\n";
					} else if(result[e].name == "password") {
						errorString += "Error #" + (e + 1) + " : Please enter a valid password using letters and numbers and between 4 and 10 characters.\n\n";
					}
				}
				alert(errorString);
			} else {
				Cookie.set('tablename', result);
				window.location.href = '/list';
			}
		});
	}
});

Template.create.onRendered(function() {
	document.title = "Live Question Tool Creation Area";
});
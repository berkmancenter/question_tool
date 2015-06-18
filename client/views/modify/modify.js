Template.modify.events({
	"click #submitbutton": function(event, template) {
		var question = document.getElementsByName("comment")[0].value;
		Questions.update({
			_id: template.data._id
		}, {
			$set: {
				lasttouch: new Date().getTime(),
				text: question
			}
		}, function(error, count, status) {
			if(error) {
				console.log(error);
			} else {
				window.location.href = "/list";
			}				
		});
	},
	"keypress #modifybox": function(e, template) {
		e.which = e.which || e.keyCode;
		console.log(e.which);
		if(e.which == 13) {
			e.preventDefault();
			document.getElementById("submitbutton").click();
		}
	}
});
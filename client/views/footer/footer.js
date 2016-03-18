Template.footer.events({
	"click #creditsbutton": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.credits, parentNode);
	},
	"change select": function(evt) {
	  reconnect_interval = $(evt.target).val();
	  Meteor.clearInterval(reconnect);
	  reconnect = Meteor.setInterval( function () { 
	  	Meteor.reconnect();
	  }, reconnect_interval );
	}
});
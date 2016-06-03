Template.footer.events({
	"click #creditsbutton": function(event, template) {
		var parentNode = document.getElementById("banner");
		popoverTemplate = Blaze.render(Template.credits, parentNode);
	}
});
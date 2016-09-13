Template.footer.events({
	"click #creditsbutton": function(event, template) {
		var parentNode = document.getElementById("nav");
		popoverTemplate = Blaze.render(Template.credits, parentNode);
	}
});
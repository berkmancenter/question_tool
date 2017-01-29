Template.footer.events({
  'click #creditsbutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.render(Template.credits, parentNode);
  },
});

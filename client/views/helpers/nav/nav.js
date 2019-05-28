/* eslint-disable func-names, no-unused-vars */
Template.nav.events({
  'click #navLogout': function (event, template) {
    Meteor.logout();
    // Tracker.flush();
    window.location.reload();
  },
  'click #navLogin': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.render(Template.login, parentNode);
  },
  'click #navShare': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.renderWithData(Template.share, template.data.slug, parentNode);
  },
  'click #navRegister': function (event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.render(Template.register, parentNode);
  },
  'click #navAdmin': function (event, template) {
    if ($('.admincontainer').css('display') === 'none') {
      $('.admincontainer').css('display', 'flex').hide().slideDown();
    } else {
      $('.admincontainer').slideUp();
    }
  },
  'click #navHome': function (event, template) {
    document.getElementById('searchbar').value = '';
    Session.set('search', '');
    Router.go('/');
  },
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});

/* eslint-enable func-names, no-unused-vars */


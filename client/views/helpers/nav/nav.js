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
  'click #navCode': function(event, template) {
    const parentNode = document.getElementById('nav');
    popoverTemplate = Blaze.renderWithData(Template.qr_code, {
      link: Meteor.absoluteUrl() + `/list/${template.data.slug}`
    }, parentNode);
  },
  'click #navArchive': function(event, template) {
    $('#navArchive').find('i').attr('class', 'fa fa-refresh fa-spin');
    Meteor.call('createPDF', template.data.slug, function (error, result) {
      $('#navArchive').find('i').attr('class', 'fa fa-download');
      if(error) {
        var sAlertId = sAlert.error('Something went wrong, please try again', {timeout: 4000, position: 'top-right', onClose: function() {
          sAlert.close(sAlertId);
        }});
      } else {
        var sAlertId = sAlert.success('Email with Archive PDF sent, please check your mailbox', {timeout: 4000, position: 'top-right', onClose: function() {
          sAlert.close(sAlertId);
        }});
      }
    })
  }
});

/* eslint-enable func-names, no-unused-vars */

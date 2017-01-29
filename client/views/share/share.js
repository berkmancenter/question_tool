Template.share.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.share.helpers({
  shareLink() {
    return window.location.origin + '/list/' + Session.get('tablename').toLowerCase();
  },
});

Template.share.events({
  'click #shareclosebutton': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});

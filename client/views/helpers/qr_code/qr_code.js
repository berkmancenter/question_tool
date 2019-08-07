Template.qr_code.helpers({
  link() {
    return Template.instance().data.link;
  }
});

Template.qrcode.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.qr_code.helpers({
  link() {
    return Template.instance().data.link;
  }
})

Template.qr_code.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

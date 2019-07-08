Template.qr_code.helpers({
  link() {
    return 'https://www.gmail.com'
  }
})

Template.qr_code.onRendered(() => {
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

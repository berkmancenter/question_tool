import { Questions, Answers } from '/lib/common.js';

Template.answers.onRendered(() => {
  // When the template is rendered, sets the document title
  $('.formcontainer').hide().fadeIn(400);
  $('#darker').hide().fadeIn(400);
});

Template.answers.helpers({
  question() {
    const id = Template.currentData();
    return Questions.findOne({ _id: id });
  },
  date_format(timeorder) {
    return moment(timeorder).format('LLL');
  },
  time_format(timeorder) {
    return moment(timeorder).fromNow();
  },
  answers() {
    const id = Template.currentData();

    const answers = Answers.find({
      qid: id,
    }).fetch();

    answers.reverse();
    for (let a = 0; a < answers.length; a++) {
      answers[a].text = answers[a].text.replace(/\B(@\S+)/g, '<strong>$1</strong>');
      // eslint-disable-next-line max-len
      const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
      answers[a].text = answers[a].text.replace(urlRegex, (url) => {
        let fullURL = url;
        if (url.indexOf('http://') === -1 || url.indexOf('https://') === -1) {
          fullURL = 'http://' + url;
        }
        return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
      });
    }

    return answers;
  },
});

/* eslint-disable func-names, no-unused-vars */
Template.answers.events({
  'click #darker': function (event, template) {
    $('.formcontainer').fadeOut(400);
    $('#darker').fadeOut(400, () => {
      Blaze.remove(popoverTemplate);
    });
  },
});
/* eslint-enable func-names, no-unused-vars */

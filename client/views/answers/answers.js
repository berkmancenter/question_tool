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
      const urlRegex = new RegExp(SimpleSchema.RegEx.Url.source.slice(1, -1), 'ig');
      answers[a].text = answers[a].text.replace(urlRegex, url =>
        '<a target="_blank" class="questionLink" rel="nofollow" href="' + url + '">' + url + '</a>');
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

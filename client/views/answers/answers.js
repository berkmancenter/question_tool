Template.answers.onCreated(function () {
  // Checks whether the user has a valid table cookie
  Meteor.call('cookieCheck', Session.get("tablename"), function (error, result) {
    if(!result) {
      // If not, redirect back to the chooser page
      window.location.href = "/";
    }
  });
});

Template.answers.onRendered(function() {
  // When the template is rendered, sets the document title
  $(".formcontainer").hide().fadeIn(400);
  $("#darker").hide().fadeIn(400);
});

Template.answers.helpers({
  question: function() {
    var id = Template.currentData();
    return Questions.findOne({ _id: id });
  },
  date_format: function(timeorder){
    return moment(timeorder).format('LLL');
  },
  time_format: function(timeorder){
    return moment(timeorder).fromNow();
  },
  answers: function() {
    var id = Template.currentData();

    var answers = Answers.find({
      qid: id
    }).fetch();

    answers.reverse()
    for(var a = 0; a < answers.length; a++) {
      answers[a].text = answers[a].text.replace(/\B(@\S+)/g, "<strong>$1</strong>");
      var urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
      answers[a].text = answers[a].text.replace(urlRegex, function(url) {
        if(url.indexOf("http://") == -1) {
          var fullURL = "http://" + url;
        } else {
          fullURL = url;
        }
        return '<a target="_blank" class="questionLink" rel="nofollow" href="' + fullURL + '">' + url + '</a>';
      });
    }

    return answers;
  }
});

Template.answers.events({
  "click #darker": function(event, template) {
    $(".formcontainer").fadeOut(400);
    $("#darker").fadeOut(400, function() {
      Blaze.remove(popoverTemplate);
    });
  }
});

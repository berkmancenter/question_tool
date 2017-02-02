import { Instances } from '/lib/common.js';

function showCreateError(reason) {
  if (typeof currentError !== 'undefined') {
    Blaze.remove(currentError);
  }
  const parentNode = document.getElementById('recent');
  const nextNode = document.getElementById('questionscontainer');
  currentError = Blaze.renderWithData(Template.form_error, reason, parentNode, nextNode);
}

Template.home.onCreated(() => {
  Session.set('search', '');
});

Template.home.onRendered(function () {
  // When the template is rendered, set the document title
  document.title = 'Live Question Answer Tool Chooser';
  this.autorun(() => {
    if (Meteor.user()) {
      Meteor.call('superadmin', (error, result) => {
        Session.set('superadmin', result);
      });
    }
  });
});

Template.home.helpers({
  hasFaves(faves) {
    // removing favorites results in a favorites array with empty elements
    // so to make sure there is never an empty "favorites" section, we have to check
    let res = false;
    for (let i = 0; i < faves.length; i++) {
      if (faves[i] && Instances.findOne({ _id: faves[i] })) {
        res = true;
        break;
      }
    }
    return res;
  },
  time_format(lasttouch) {
    return moment(lasttouch).fromNow();
  },
  toolAdmin() {
    Meteor.call('admin', Meteor.user().emails[0].address, (error, result) => {
      if (result) {
        Session.set('toolAdmin', true);
      }
    });
    return Session.get('toolAdmin');
  },
  hasToday() {
    const instances = Template.instance().data;
    let greatest = 0;
    let faves = [];
    if (Meteor.user() && Meteor.user().profile.favorites) { faves = Meteor.user().profile.favorites; }
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].lasttouch > greatest && faves.indexOf(instances[i]._id) === -1) {
        greatest = instances[i].lasttouch;
      }
    }
    const ht = (greatest > (new Date().getTime() - 86400000));
    return ht;
  },
  hasWeek() {
    let faves = [];
    if (Meteor.user() && Meteor.user().profile.favorites) { faves = Meteor.user().profile.favorites; }
    const instances = Template.instance().data;
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].lasttouch > (new Date().getTime() - 604800000) && faves.indexOf(instances[i]._id) === -1) {
        if (instances[i].lasttouch < (new Date().getTime() - 86400000)) {
          return true;
        }
      }
    }
    return false;
  },
  hasMonth() {
    const instances = Template.instance().data;
    let oldest = new Date().getTime();
    let faves = [];
    if (Meteor.user() && Meteor.user().profile.favorites) { faves = Meteor.user().profile.favorites; }
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].lasttouch < oldest && faves.indexOf(instances[i]._id) === -1) {
        oldest = instances[i].lasttouch;
      }
    }
    const hm = (oldest > (new Date().getTime() - 2678400000)) && (oldest < (new Date().getTime() - 604800000));
    return hm;
  },
  instanceList() {
    const re = new RegExp(Session.get('search'), 'i');
    let instances;
    if (Session.get('search') === 'all') {
      instances = Template.instance().data;
    } else {
      instances = Instances.find({
        $or: [{
          tablename: {
            $regex: re,
          },
        }, {
          description: {
            $regex: re,
          },
        }, {
          author: {
            $regex: re,
          },
        }],
      }).fetch();
    }
    instances.sort((a, b) => (b.lasttouch - a.lasttouch));
    for (let i = 0; i < instances.length; i++) {
      if (Meteor.user()) {
        if (Meteor.user().profile.favorites) {
          if (Meteor.user().profile.favorites.indexOf(instances[i]._id) !== -1) {
            instances[i].isFavorite = true;
          }
        }
        if (instances[i].admin === Meteor.user().emails[0].address) {
          instances[i].isAdmin = true;
        } else if (instances[i].moderators) {
          if (instances[i].moderators.indexOf(Meteor.user().emails[0].address) !== -1) {
            instances[i].isMod = true;
          }
        }
      }
      if (instances[i].description.length > 140) {
        instances[i].description = instances[i].description.substring(0, 137) + '...';
      }
      if (instances[i].tablename.length > 15) {
        instances[i].tablename = instances[i].tablename.substring(0, 13) + '...';
      }
      if (!instances[i].author) {
        instances[i].author = 'Anonymous';
      }
      if ((new Date().getTime() - instances[i].lasttouch) <= 86400000) {
        instances[i].today = true;
      } else if ((new Date().getTime() - instances[i].lasttouch) <= 604800000) {
        instances[i].week = true;
      } else if ((new Date().getTime() - instances[i].lasttouch) <= 2678400000) {
        instances[i].month = true;
      }
    }
    if (instances.length < 1) {
      showCreateError('Nothing found.');
    } else if (typeof currentError !== 'undefined') {
      Blaze.remove(currentError);
    }
    return instances;
  },
});

/* eslint-disable func-names, no-unused-vars */
Template.home.events({
  // When the submit button is clicked
  'keyup .searchbar': function (event, template) {
    if (event.target.value) {
      Session.set('search', event.target.value);
    } else {
      Session.set('search', '');
    }
    // return Users.find({name: {$regex: re}});
  },
  'click .favoritebutton': function (event, template) {
    event.stopPropagation();
    Meteor.call('addFavorite', event.target.parentElement.id);
  },
  'click .unfavoritebutton': function (event, template) {
    event.stopPropagation();
    Meteor.call('removeFavorite', event.target.parentElement.id);
  },
  'click #navCreate': function (event, template) {
    let parentNode;
    if (Meteor.user()) {
      const nextNode = document.getElementById('mwrapper');
      parentNode = document.getElementById('main-wrapper');
      dropDownTemplate = Blaze.render(Template.create, parentNode, nextNode);
      const questionDiv = document.getElementById('toparea');
      if (questionDiv.style.display === 'none' || !questionDiv.style.display) {
        $('#navCreate').html('Close');
        document.getElementById('navCreate').style.backgroundColor = '#ec4f4f';
        $('#toparea').slideDown();
      } else {
        if (typeof currentError !== 'undefined') {
          Blaze.remove(currentError);
        }
        $('#navCreate').html('+ Create');
        document.getElementById('navCreate').style.backgroundColor = '#27ae60';
        $('#toparea').slideUp();
        if (typeof dropDownTemplate !== 'undefined') {
          Blaze.remove(dropDownTemplate);
        }
      }
      // Router.go('/create');
    } else {
      parentNode = document.getElementById('nav');
      popoverTemplate = Blaze.render(Template.register, parentNode);
    }
  },
  'click .superadmindeletebutton': function (event, template) {
    popoverTemplate = Blaze.renderWithData(Template.delete, Instances.findOne({ _id: $(event.target).data('instanceid') }), document.getElementById("nav"));
    event.stopPropagation();
  },
  'click .superadminrenamebutton': function (event, template) {
    const parentNode = document.getElementById('nav');
    const table = Instances.findOne({
      _id: event.currentTarget.id,
    });
    popoverTemplate = Blaze.renderWithData(Template.rename, {
      table,
      isList: false,
    }, parentNode);
    event.stopPropagation();
  },
});
/* eslint-enable func-names, no-unused-vars */

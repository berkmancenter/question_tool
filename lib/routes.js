/* eslint-disable func-names */
import { Instances, Questions, Answers } from './common.js';

Router.configure({
  notFoundTemplate: 'not_found',
  loadingTemplate: 'loading',
});

Router.route('home', {
  path: '/',
  template: 'home',
  data() {
    return Instances.find({ hidden: { $ne: true } }).fetch();
  },
  fastRender: true,
});

Router.route('/credits', function () {
  this.render('credits');
});

Router.route('/dashboard', function () {
  this.render('dashboard');
});

Router.route('/create', function () {
  if (Meteor.user()) {
    this.render('create');
  } else {
    this.render('newloginwithkey', {
      data: 'create',
    });
  }
});

Router.route('/admin', function () {
  this.render('admin');
});

Router.route('/propose', function () {
  this.render('propose');
});

Router.route('/report', function () {
  this.render('report');
});

Router.route('/login', function () {
  this.render('login');
});

Router.route('/delete', function () {
  this.render('delete');
});

Router.route('/add', function () {
  this.render('add');
});

// When the user visits /answer/id, display answer template with question data
Router.route('answer', {
  path: '/answer/:_id',
  template: 'answer',
  data() {
    const question = Questions.findOne({ _id: this.params._id });
    return question;
  },
});

// When the user visits /modify/id, display modify template with question data
Router.route('modify', {
  path: '/modify/:_id',
  template: 'modify',
  data() {
    const question = Questions.findOne({ _id: this.params._id });
    return question;
  },
});

// When the user visits //id1/id2, display  template with data for both questions 1 and 2
Router.route('', {
  path: '//:first/:second',
  template: '',
  data() {
    const questionData = {
      first: Questions.findOne({ _id: this.params.first }),
      second: Questions.findOne({ _id: this.params.second }),
    };
    return questionData;
  },
});

// When the user visits /list/tablename, set cookie to tablename and display list
Router.route('listlink', {
  path: '/list/:slug',
  waitOn() {
    return [
      Meteor.subscribe('questions', this.params.slug),
      Meteor.subscribe('answers', this.params.slug),
      Meteor.subscribe('votes', this.params.slug),
    ];
  },
  onBeforeAction() {
    const instance = Instances.findOne({
      slug: this.params.slug,
    });
    if (instance) {
      this.render('list', {
        data() {
          return instance;
        },
      });
    } else {
      this.render('not_found');
    }
  },
});

Router.route('/list/:slug/touch',
  {
    onBeforeAction() {
      const instanceId = Instances.findOne({ slug: this.params.slug })._id;
      Meteor.call('touch', instanceId);
      this.next();
      this.redirect('/list/' + this.params.slug);
    },
  });

/* Router.route('/list', {
  path: "/list",
  waitOn: function() {
    return [
      Meteor.subscribe('questions', Session.get("tablename")),
      Meteor.subscribe('answers', Session.get("tablename")),
      Meteor.subscribe('votes', Session.get("tablename"))
    ];
  },
    fastRender: true
});*/

// When the user visits /rename/id, display rename template with instance data
Router.route('rename', {
  path: '/rename/:_id',
  template: 'rename',
  data() {
    const instance = Instances.findOne({ _id: this.params._id });
    return instance;
  },
});

// When the user visits rss/tablename, create an RSS file using table data
Router.route('/rss/:tablename', {
  where: 'server',
  action() {
    // Retrieves table and question data for the tablename parameter
    const table = Instances.findOne({
      _id: this.params._id,
    });

    const questions = Questions.find({
      instanceid: this.params._id,
    }).fetch();

    // Creates XML header
    let xmlData = '<?xml version="1.0" encoding="utf-8"?> <rss version="2.0"> <channel>';
    xmlData += '<title>' + table.tablename + '</title>';
    xmlData += '<link>http://cyber.law.harvard.edu/questions/list/' + table._id + '</link>';
    xmlData += '<description>Questions and answers submitted during class</description>';
    xmlData += '<language>en-US</language>';
    xmlData += '<copyright>Copyright 2006 The President and Fellows of Harvard College.</copyright>';

    // Loops through the questions and adds to XML string
    for (let i = 0; i < questions.length; i++) {
      xmlData += '<item>';
      xmlData += '<title>Question (' + questions[i].votes + ')</title>';
      xmlData += '<link>http://cyber.law.harvard.edu/questions/list</link>';
      xmlData += '<description>' + questions[i].text + '</description>';
      xmlData += '<pubDate>' + questions[i].timeorder + '</pubDate>';
      xmlData += '</item>';
      // Retrieves answers for given question ID
      let answers = Answers.find({ qid: questions[i]._id });
      answers = answers.fetch();
      // Loops through the answers and adds to the XML string
      for (let j = 0; j < answers.length; j++) {
        xmlData += '<item>';
        xmlData += '<title>Answer </title>';
        xmlData += '<link>http://cyber.law.harvard.edu/questions/</link>';
        xmlData += '<description>' + answers[j].text + '</description>';
        const d = new Date(questions[i].timeorder);
        const dString = d.toUTCString();
        xmlData += '<pubDate>' + dString + '</pubDate>';
        xmlData += '</item>';
      }
    }

    xmlData += '</channel>';
    xmlData += '</rss>';

    // Writes the XLM header and finishes server response
    this.response.writeHead(200, { 'Content-Type': 'application/rss+xml' });
    this.response.end(xmlData);
  },
});

Router.route('resetpwd', {
  template: 'resetpwd',
});
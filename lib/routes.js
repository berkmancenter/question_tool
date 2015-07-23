Router.route('/', function () {
	this.render('home');
});

Router.route('/list', function () {
	this.render('list');
});

Router.route('/credits', function () {
	this.render('credits');
});

Router.route('/dashboard', function () {
	this.render('dashboard');
});

Router.route('/create', function () {
	if(Meteor.user()) {
		this.render('create');
	} else {
		this.render('newlogin', {
		    data: "create"
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

// When the user visits /newlogin/url, display modify template with rerturn URL data
Router.route('newloginwithkey', {
	path: '/newlogin/:key',
	template: 'newlogin',
	data: function() {
		return this.params.key;
	}
});

Router.route('/newlogin', function () {
	this.render('newlogin');
});

Router.route('/add', function () {
	this.render('add');
});

Router.route('/register', function () {
	this.render('register');
});

// When the user visits /answer/id, display answer template with question data
Router.route('answer', {
	path: '/answer/:_id',
	template: 'answer',
	data: function() {
		var question = Questions.findOne({_id: this.params._id});
		return question;
	}
});

// When the user visits /modify/id, display modify template with question data
Router.route('modify', {
	path: '/modify/:_id',
	template: 'modify',
	data: function() {
		var question = Questions.findOne({_id: this.params._id});
		return question;
	}
});

// When the user visits /combine/id1/id2, display combine template with data for both questions 1 and 2
Router.route('combine', {
	path: '/combine/:first/:second',
	template: 'combine',
	data: function() {
		var questionData = {
			first: Questions.findOne({_id: this.params.first}),
			second:  Questions.findOne({_id: this.params.second})
		}
		return questionData;
	}
});

// When the user visits /list/tablename, set cookie to tablename and display list
Router.route('listlink', {
	path: '/list/:tablename',
	onBeforeAction: function() {
		ReactiveCookie.set("tablename", this.params.tablename, {
			path: '/'
		});
		this.render('list');
	}
});

// When the user visits /rename/id, display rename template with instance data
Router.route('rename', {
	path: '/rename/:_id',
	template: 'rename',
	data: function() {
		var instance = Instances.findOne({_id: this.params._id});
		return instance;
	}
});

// When the user visits rss/tablename, create an RSS file using table data
Router.route('/rss/:tablename', {
	where: 'server',
	action: function() {
	
		// Retrieves table and question data for the tablename parameter
		var table = Instances.findOne({ 
			tablename: this.params.tablename
		});
		
		var questions = Questions.find({ 
			tablename: this.params.tablename 
		}).fetch();
		
		// Creates XML header
		var xmlData = '<?xml version="1.0" encoding="utf-8"?> <rss version="2.0"> <channel>';
		xmlData += "<title>" + table.tablename + "</title>";
		xmlData += "<link>http://cyber.law.harvard.edu/questions/list/" + table.tablename + "</link>";
		xmlData += "<description>Questions and answers submitted during class</description>";
		xmlData += "<language>en-US</language>";
		xmlData += "<copyright>Copyright 2006 The President and Fellows of Harvard College.</copyright>";
		
		// Loops through the questions and adds to XML string
		for(var i = 0; i < questions.length; i++) {
			xmlData += "<item>";
			xmlData += "<title>Question (" + questions[i].votes + ")</title>";
			xmlData += "<link>http://cyber.law.harvard.edu/questions/list</link>";
			xmlData += "<description>" + questions[i].text + "</description>";
			xmlData += "<pubDate>" + questions[i].timeorder + "</pubDate>";
			xmlData += "</item>";
			// Retrieves answers for given question ID
			var answers = Answers.find({ qid: questions[i]._id });
			answers = answers.fetch();
			// Loops through the answers and adds to the XML string
			for(var j = 0; j < answers.length; j++) {
				xmlData += "<item>";
				xmlData += "<title>Answer </title>";
				xmlData += "<link>http://cyber.law.harvard.edu/questions/</link>";
				xmlData += "<description>" + answers[j].text + "</description>";
				var d = new Date(questions[i].timeorder);
				var dString = d.toUTCString()
				xmlData += "<pubDate>" + dString + "</pubDate>";
				xmlData += "</item>";
			}
		}
		
		xmlData += "</channel>";
		xmlData += "</rss>";
		
		// Writes the XLM header and finishes server response
		this.response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		this.response.end(xmlData);
	}
});

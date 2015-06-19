Router.route('/', function () {
	this.render('home');
});

Router.route('/list', function () {
this.render('list');
});

Router.route('/credits', function () {
	this.render('credits');
});

Router.route('/create', function () {
	this.render('create');
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

Router.route('answer', {
	path: '/answer/:_id',
	template: 'answer',
	data: function() {
		var question = Questions.findOne({_id: this.params._id});
		return question;
	}
});

Router.route('modify', {
	path: '/modify/:_id',
	template: 'modify',
	data: function() {
		var question = Questions.findOne({_id: this.params._id});
		return question;
	}
});

Router.route('listlink', {
	path: '/list/:tablename',
	onBeforeAction: function(pause) {
		Cookie.set("tablename", this.params.tablename, {
			path: '/'
		});
		this.render('list');
	}
});

Router.route('/rss/:tablename', {
	where: 'server',
	action: function() {
		
		var table = Instances.findOne({ 
			tablename: this.params.tablename
		});
		
		var questions = Questions.find({ 
			tablename: this.params.tablename 
		}).fetch();
		
		var xmlData = '<?xml version="1.0" encoding="utf-8"?> <rss version="2.0"> <channel>';
		xmlData += "<title>" + table.tablename + "</title>";
		xmlData += "<link>http://localhost:3000/list/" + table.tablename + "</link>";
		xmlData += "<description>Questions and answers submitted during class</description>";
		xmlData += "<language>en-US</language>";
		xmlData += "<copyright>Copyright 2006 The President and Fellows of Harvard College.</copyright>";
		
		for(var i = 0; i < questions.length; i++) {
			xmlData += "<item>";
			xmlData += "<title>Question (" + questions[i].votes + ")</title>";
			xmlData += "<link>http://localhost:3000/</link>";
			xmlData += "<description>" + questions[i].text + "</description>";
			xmlData += "<pubDate>" + questions[i].timeorder + "</pubDate>";
			xmlData += "</item>";
			var answers = Answers.find({ qid: questions[i]._id });
			answers = answers.fetch();
			for(var j = 0; j < answers.length; j++) {
				xmlData += "<item>";
				xmlData += "<title>Answer </title>";
				xmlData += "<link>http://localhost:3000</link>";
				xmlData += "<description>" + answers[j].text + "</description>";
				var d = new Date(questions[i].timeorder);
				var dString = d.toUTCString()
				xmlData += "<pubDate>" + dString + "</pubDate>";
				xmlData += "</item>";
			}
		}
		
		xmlData += "</channel>";
		xmlData += "</rss>";
		
		this.response.writeHead(200, {'Content-Type': 'application/rss+xml'});
		this.response.end(xmlData);
	}
});

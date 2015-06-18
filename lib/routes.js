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

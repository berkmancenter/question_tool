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

Router.route('answer', {
	path: '/answer/:_id',
	template: 'answer',
	data: function() {
		var question = Questions.findOne({_id: this.params._id});
		console.log(question);
		return question;
	}
});




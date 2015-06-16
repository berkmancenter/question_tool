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

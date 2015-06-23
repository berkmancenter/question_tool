Template.report.onRendered(function() {
	var d = new Date();
	document.getElementsByName("e_year")[0].value = d.getYear() + 1900;
	document.getElementsByName("e_mo")[0].value = d.getMonth()+1;
	document.getElementsByName("e_day")[0].value = d.getDate();
})

Template.report.events({
	'click #submitbutton': function(event, template) {
		Session.set("startYear", document.getElementsByName("b_year")[0].value);
		Session.set("startMonth", document.getElementsByName("b_mo")[0].value);
		Session.set("startDay", document.getElementsByName("b_day")[0].value);
		Session.set("endYear", document.getElementsByName("e_year")[0].value);
		Session.set("endMonth", document.getElementsByName("e_mo")[0].value);
		Session.set("endDay", document.getElementsByName("e_day")[0].value);
	}
});

Template.report.helpers({
	questions: function() {
		var beginTime = mktime(0, 0, 0, Session.get("startMonth"), Session.get("startDay"), Session.get("startYear")) * 1000;
		var endTime = mktime(23, 59, 59, Session.get("endMonth"), Session.get("endDay"), Session.get("endYear")) * 1000;
		var questions = Questions.find({
			tablename: Cookie.get("tablename"),
			timeorder: { 
				'$gt' : beginTime, 
				'$lt' : endTime 
			}
		}).fetch();
		questions.sort(function(a, b) {
			if(a.timeorder > b.timeorder) {
				return 1;
			} else if(a.timeorder < b.timeorder) {
				return -1;
			} else {
				return 0;
			}
		});
		for(var q = 0; q < questions.length; q++) {
			var d = new Date(questions[q].timeorder);
			questions[q].timeorder = getTime(d.toTimeString().substring(0,5)) + " " + d.toDateString().substring(4, 10);
			var answers = Answers.find({ 
				qid: questions[q]._id
			});
			if(answers.fetch().length > 0) {
				questions[q].answer = answers.fetch();
			}
		}
		return questions;
	}
});

// mktime() function courtesy of PHP.js
// http://phpjs.org/functions/mktime/

function mktime() {
	var d = new Date(),
	r = arguments,
	i = 0,
	e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];
	for (i = 0; i < e.length; i++) {
		if (typeof r[i] === 'undefined') {
			r[i] = d['get' + e[i]]();
			r[i] += (i === 3);
		} else {
			r[i] = parseInt(r[i], 10);
			if (isNaN(r[i])) {
				return false;
			}
		}
	}
	r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);
	d.setFullYear(r[5], r[3] - 1, r[4]);
	d.setHours(r[0], r[1], r[2]);
	return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}

function getTime(time) {
	var tmpArr = time.split(':'), time12;
	if(+tmpArr[0] == 12) {
		time12 = tmpArr[0] + ':' + tmpArr[1] + 'pm';
	} else {
		if(+tmpArr[0] == 00) {
			time12 = '12:' + tmpArr[1] + 'am';
		} else {
			if(+tmpArr[0] > 12) {
				time12 = (+tmpArr[0]-12) + ':' + tmpArr[1] + 'pm';
			} else {
				time12 = (+tmpArr[0]) + ':' + tmpArr[1] + 'am';
			}
		}
	}
	return time12;
}
Template.report.helpers({
	'#submitbutton click': function() {
		alert("clicked");
	}
});

function mktime(hour,minute,month,day,year) {
    return new Date(year, month - 1, day, hour, minutes, 0).getTime() / 1000;
}
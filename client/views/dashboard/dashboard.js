Template.dashboard.helpers({
	instances: function() {
		var instances = Instances.find().fetch();
		instances.sort(function(a, b) {
		    return a.order - b.order;
		});
		return instances
	}
});

Template.dashboard.onRendered(function() {
	document.title = "Quesiton Tool Admin Dashboard";
	$( "#admintable tbody" ).sortable({
	    placeholder: "ui-state-highlight",
		update: function(event, ui) {
			var arrangement = $("#admintable tbody").sortable("toArray");
			Meteor.call('rearrange', arrangement, Cookie.get("tooladmin_pw"), function(error, result) {
				if(error) {
					alert(error);
				}
			});
		}
	});
	$( "#admintable tbody" ).disableSelection();
	/*interact('#admintable tr')
	.draggable({
		// Divs have inertia and continue moving when mouse is released
		inertia: true,
		restrict: {
			restriction: "parent",
			endOnly: true,
			elementRect: { top: 0, left: 0, bottom: 0, right: 0 }
		},
		onmove: dragMoveListener,
		onend: function (event) {
			// When the question div is dropped, return to original position
			event.target.style.cssText = "-webkit-transform: translate(0px, 0px);z-index:0!important;";
  			event.target.setAttribute('data-x', 0);
			event.target.setAttribute('data-y', 0);
		}
	});
	function dragMoveListener(event) {
		var target = event.target,
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
		// Translates the question div to the current mouse position
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		// Sets the z-index to 99999 so the question div floats above others
		target.style.cssText += "z-index:99999!important;"
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}*/
});

Template.dashboard.events({
	"click .deletebutton": function(event, template) {
		var check = confirm("Are you sure you would like to delete the instance?");
		if(check) {
			Meteor.call('adminRemove', Cookie.get("tooladmin_pw"), event.currentTarget.id, false, function(error, result) {
				if(error) {
					alert(error);
				}
			});
		}
	},
	"click .renamebutton": function(event, template) {
		if(event.currentTarget.children[0].id == "rename") {
			event.currentTarget.children[0].innerHTML = "Done";
			event.currentTarget.children[0].id = "done";
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			var tableName = tableNode.children[0].children[0].innerHTML;
			tableNode.children[0].style.display = "none";
			tableNode.children[1].className = "visibleinput";
		} else if(event.currentTarget.children[0].id == "done") {
			var tableNode = event.currentTarget.parentNode.parentNode.children[0];
			tableNode.children[0].style.display = "inline";
			tableNode.children[1].className = "hiddeninput";
			Meteor.call('rename', event.currentTarget.id, tableNode.children[1].value, Cookie.get("tooladmin_pw"), 0, function(error, result) {
				event.currentTarget.children[0].innerHTML = "Rename";
			});
			event.currentTarget.children[0].id = "rename";
		}
	},
	"keypress input": function(event, template) {
		event.which = event.which || event.keyCode;
		if(event.which == 13) {
			event.preventDefault();
			event.currentTarget.parentNode.parentNode.children[1].children[0].click();
		}
	}
})
Meteor.methods({
	getIP: function () {
		return this.connection.clientAddress;
	},
	cookieCheck: function() {
		//check whether current user has the proper cookies
	},
	unhide: function(table) {
		Questions.update({
			tablename: table
		}, {
			$set: {
				state: "normal"
			},
		}, {
			multi: true
		}, function(error, count, status) {
			if(!error) {
				return true;
			}
		});
	},
	remove: function(table) {
		Questions.remove({
			tablename: table
		}, function(error) {
			if(error) {
				alert(error);
			} else {
				Answers.remove({
					tablename: table
				}, function(error) {
					if(error) {
						alert(error);
					} else {
						Instances.remove({
							tablename: table
						}, function(error) {
							if(error) {
								alert(error);
							} else {
								Votes.remove({
									tablename: table
								}, function(error) {
									if(error) {
										alert(error);
									} else {
										return true;
									}
								});
							}
						});
					}
				});
			}
		});
	}
});
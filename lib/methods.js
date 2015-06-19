Meteor.methods({
	getIP: function () {
		return this.connection.clientAddress;
	},
	cookieCheck: function(cookie) {
		if(cookie == null) {
			return false;
		} else {
			return true;
		}
	},
	listCookieCheck: function(table) {
		var table = Instances.findOne({
			tablename: table
		});
		if(table == null) {
			return false;
		} else {
			return true;
		}
	},
	adminCheck: function(password, tablename) {
		var table = Instances.findOne({
			tablename: tablename
		});
		if((password == table.password) && (password && table.password)) {
			return true;
		} else {
			return false;
		}
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
	modify: function(question, id, password, table) {
		var instance = Instances.findOne({
			tablename: table
		});
		if((password != instance.password) || (!password || !instance.password)) {
			return false;
		}
		Questions.update({
			_id: id
		}, {
			$set: {
				lasttouch: new Date().getTime(),
				text: question
			}
		}, function(error, count, status) {
			if(error) {
				return false;
			}			
		});
	},
	propose: function(tablename, question, posterName, posterEmail, ip) {
		var table = Instances.findOne({
			tablename: tablename
		});
		if(table == null) {
			return false;
		} else {
			Questions.insert({
				tablename: tablename,
				text: question,
				poster: posterName,
				email: posterEmail,
				ip: ip,
				timeorder: new Date().getTime(),
				lasttouch: new Date().getTime(),
				state: "normal",
				votes: 0
			}, function(error, id) {
				if(error) {
					return false;
				}
			});
		}
	},
	remove: function(password, table) {
		var instance = Instances.findOne({
			tablename: table
		});
		if((password != instance.password) || (!password || !instance.password)) {
			return false;
		}
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
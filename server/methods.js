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
	getTable: function(tablename) {
		return Instances.findOne({ 
			tablename: tablename
		});
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
	answer: function(tablename, answer, posterName, email, result, currentURL) {
		var keys = "";
		var quesiton = Questions.findOne({
			_id: currentURL
		});
		if(quesiton == null) {
			return false;
		} else {
			Answers.insert({
				text: answer,
				poster: posterName,
				email: email,
				ip: result,
				tablename: tablename,
				qid: currentURL
			}, function(error, id) {
				if(error) {
					keys = error.invalidKeys;
				}
			});
		}
		return keys;
	},
	create: function(tablename, threshhold, redLength, stale, description, passwordConfirm) {
		var keys;
		Instances.insert({
			tablename: tablename,
			threshhold: threshhold,
			new_length: redLength,
			stale_length: stale, 
			description: description,
			password: passwordConfirm,
		}, function(error, id) {
			if(error) {
				keys = error.invalidKeys;
			} else {
				Questions.insert({
					tablename: tablename,
					text: "Welcome to the live question tool. Feel free to post questions. Vote by clicking on the votes box.",
					poster: "the system",
					timeorder: new Date().getTime(),
					lasttouch: new Date().getTime(),
					state: "normal",
					votes: 0,
				}, function(error, id) {
					if(error) {
						keys = error.invalidKeys;
					}
				});
			}
		});
		if(keys) {
			return keys;
		} else {
			return tablename;
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
		var keys = "";
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
					keys = error.invalidKeys;
				}
			});
		}
		return keys;
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
	},
	vote: function(id, ip, tablename) {
		var keys = "";
		var votes = Votes.find({
			qid: id,
			ip: ip
		});
		if(votes.fetch().length == 0) {
			Questions.update({
				_id: id
			}, {
				$set: {
					lasttouch: new Date().getTime()
				},
				$inc: {
					votes: 1
				}
			}, function(error, count, status) {
				if(error) {
					keys = error;
				} else {
					Votes.insert({
						qid: id, 
						ip: ip, 
						tablename: tablename,
					}, function(error, id) {
						if(error) {
							keys = error;
						}
					});
				}				
			});
		}
		return keys;
	},
	hide: function(id) {
		Questions.update({
			_id: id
		}, {
			$set: {
				state: "disabled"
			}
		}, function(error, count, status) {
			if(error) {
				return false;
			} 
		});
	}
});
Meteor.methods({
	// A method that checks whether the Question Tool admin password is correct
	admin: function(email) {
		if(email === "nrubin999@gmail.com") {
			return true;
		} else {
			return false;
		}
	},
	// A method that returns the current connection's IP address
	getIP: function () {
		return this.connection.clientAddress;
	},
	// A method that checks whether the user has a valid cookie
	cookieCheck: function(cookie) {
		if(cookie == null) {
			return false;
		} else {
			return true;
		}
	},
	// A method that returns a table given a tablename
	getTable: function(tablename) {
		return Instances.findOne({ 
			tablename: { 
				$regex: new RegExp("^" + tablename, "i") 
			}
		});
	},
	// A method that checks whether a table exists with parameter tablename
	listCookieCheck: function(table) {
		var table = Instances.findOne({
			tablename: { 
				$regex: new RegExp("^" + table, "i") 
			}
		});
		if(table == null) {
			return false;
		} else {
			return true;
		}
	},
	// A method that checks whether the email matches the admin of the supplied tablename
	adminCheck: function(user, tablename) {
		var table = Instances.findOne({
			tablename: tablename
		});
		if(((user == table.admin) || (table.moderators.indexOf(user) != -1)) && (user && table.admin)) {
			return true;
		} else {
			return false;
		}
	},
	// A method that adds an answer to the databases
	answer: function(tablename, answer, posterName, email, result, currentURL) {
		var keys = "";
		answer.replace(/<(?:.|\n)*?>/gm, '');
		// Retrieves the current quesetion from the DB (if one exists)
		var quesiton = Questions.findOne({
			_id: currentURL
		});
		if(quesiton == null) {
			return false;
		} else {
			// Inserts the answer into the answer databse
			Answers.insert({
				text: answer,
				poster: posterName,
				email: email,
				ip: result,
				tablename: tablename,
				qid: currentURL
			}, function(error, id) {
				// If error, set keys to the error object
				if(error) {
					keys = error.invalidKeys;
				} else {
					// If successful, update lasttouch of the question
					Questions.update({
						_id: currentURL
					}, {
						$set: {
							lasttouch: new Date().getTime()
						}
					}, function(error, count, status) {
						if(error) {
							return false;
						}
					});
				}
			});
		}
		// Return keys (will be error.invalidKeys object if error exists)
		return keys;
	},
	// A method that adds an instance to the databases
	create: function(tablename, threshhold, redLength, stale, description, mods, admin, maxQuestion, maxResponse, anonymous, isHidden, author) {
		var keys;
		if(mods.length > 8) {
			var errors = [
				{
					"name": "modlength"
				}
			];
			return errors;
		}
		// Inserts the instance into the instances database
		Instances.insert({
			tablename: tablename,
			threshhold: threshhold,
			new_length: redLength,
			stale_length: stale, 
			description: description,
			moderators: mods,
			/*password: passwordConfirm,*/
			lasttouch: new Date().getTime(),
			admin: admin,
			max_question: maxQuestion,
			max_response: maxResponse,
			anonymous: anonymous,
			hidden: isHidden,
			author: author
		}, function(error, id) {
			// If error, set keys to the error object
			if(error) {
				keys = error.invalidKeys;
			} else {
				// If successful, add the "starter" question to the questions database
				Questions.insert({
					tablename: tablename,
					text: "Welcome to the live question tool. Feel free to post questions. Vote by clicking on the votes box.",
					poster: "the system",
					timeorder: new Date().getTime(),
					lasttouch: new Date().getTime(),
					state: "normal",
					votes: 0,
				}, function(error, id) {
					// If error, set keys to the error object
					if(error) {
						keys = error.invalidKeys;
					}
				});
			}
		});
		// If error (keys is defined), return the keys (error.invalidKeys) object
		if(keys) {
			return keys;
		} else {
			// If successful, return the name of the newly created table
			return tablename;
		}
	},
	rearrange: function(arrangement, email) {
		if(email === "nrubin999@gmail.com") {
			for(var i = 0; i < arrangement.length; i++) {
				Instances.update({
					_id: arrangement[i]
				}, {
					$set: {
						order: i
					}
				}, function(error, count, status) {
					if(error) {
						return false;
					}
				});
			}
		} else {
			return false;
		}
	},
	// Method that unhides every question in a given table
	unhide: function(email, table) {
		var instance = Instances.findOne({
			tablename: table
		});
		if(email === instance.admin) {
			// Sets state to normal for every question with tablename table
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
		}
	},
	addMods: function(mods, table, email) {
		var keys;
		var instance = Instances.findOne({
			tablename: table
		});
		if(email === instance.admin) {
			Instances.update({
				tablename: table
			}, {
				$push: {
					moderators: {
						$each: mods
					}
				}
			}, function(error, count, status) {
				if(error) {
					keys = error.invalidKeys;
				}
			});
		} else {
			return false;
		}
		if(keys) {
			return keys;
		} else {
			return true;
		}
	},
	removeMods: function(mod, table, email) {
		var instance = Instances.findOne({
			tablename: table
		});
		if(email === instance.admin) {
			Instances.update({
				tablename: table
			}, {
				$pull: {
					moderators: mod
				}
			}, function(error, count, status) {
				if(!error) {
					return true;
				}
			});
		} else {
			return false;
		}
		return true;
	},
	// Method that modifies a question
	modify: function(question, id, email, table) {
		// Checks whether the user has the proper admin privileges
		var instance = Instances.findOne({
			tablename: table
		});
		if(email || instance.admin) {
			if(email != instance.admin) {
				if(instance.moderators.indexOf(email) == -1) {
					return false;
				}
			}
		} else {
			return false;
		}
		// Updates the question with the proper ID to the new question text
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
		return true;
	},
	// Method that combines two questions and answers
	combine: function(question, id1, id2, password, table) {
		// Checks whether the user has proper admin privileges
		var instance = Instances.findOne({
			tablename: table
		});
		if((password != instance.password) || (!password || !instance.password)) {
			return false;
		}
		var question2 = Questions.findOne({
			_id: id2
		});
		// Updates the text of the FIRST question
		Questions.update({
			_id: id1
		}, {
			$set: {
				lasttouch: new Date().getTime(),
				text: question
			}, 
			$inc: {
				votes: question2.votes
			}
		}, function(error, count, status) {
			if(error) {
				return false;
			} else {
				// Sets the QID of the answers to the second question to the first QID of the first question (combining them)
				Answers.update({
					qid: id2
				}, {
					$set: {
						qid: id1
					}
				}, function(error, count, status) {
					if(error) {
						return false;
					} else {
						
					}
				});
			}		
		});
	},
	// Method that adds a new question to the database
	propose: function(tablename, question, posterName, posterEmail, ip) {
		var keys;
		question.replace(/<(?:.|\n)*?>/gm, '');
		// Gets the current table
		var table = Instances.findOne({
			tablename: tablename
		});
		if(table == null) {
			return false;
		} else {
			// Update the lasttouch of the Instance
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
					// If error, store object in keys variable
					keys = error.invalidKeys;
				}
			});
			/*Instances.update({
				_id: table._id
			}, {
				$set: {
					lasttouch: new Date().getTime()
				}
			}, function(error, count, status) {
				return {
					error: error
				}
				if(error) {
					// If error, store object in keys variable
					keys = error.invalidKeys;
				} else {
					// If successful, insert question into quesitons DB
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
							// If error, store object in keys variable
							keys = error.invalidKeys;
						}
					});
				}		
			});*/
		}
		return keys;
	},
	// Method that removes a table from the database
	remove: function(password, table) {
		// Ensures that the user has proper admin privileges
		var instance = Instances.findOne({
			tablename: table
		});
		if((password != instance.password) || (!password || !instance.password)) {
			return false;
		}
		// Removes all questions with the given tablename
		Questions.remove({
			tablename: table
		}, function(error) {
			if(error) {
				alert(error);
			} else {
				// If successful, removes all answers with the given tablename
				Answers.remove({
					tablename: table
				}, function(error) {
					if(error) {
						alert(error);
					} else {
						// If successful, remove the instance with the given tablename
						Instances.remove({
							tablename: table
						}, function(error) {
							if(error) {
								alert(error);
							} else {
								// If successful, remove all votes with the given tablename
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
	adminRemove: function(password, id, email) {
		// Ensures that the user has proper admin privileges
		var result;
		var hasAccess = false;
		var table = Instances.findOne({
			_id: id
		});
		if(email) {
			if(email == table.admin) {
				hasAccess = true;
			}
		} else {
			if(password === "QuestionTool2015") {
				hasAccess = true;
			}
		}
		if(hasAccess) {
			//Removes all of the questions with the given table ID
			Questions.remove({
				q: table.tablename
			}, function(error) {
				if(error) {
					alert(error);
				} else {
					// If successful, removes all answers with the given tablename
					Answers.remove({
						tablename: table.tablename
					}, function(error) {
						if(error) {
							alert(error);
						} else {
							// If successful, remove the instance with the given tablename
							Instances.remove({
								tablename: table.tablename
							}, function(error) {
								if(error) {
									alert(error);
								} else {
									// If successful, remove all votes with the given tablename
									Votes.remove({
										tablename: table.tablename
									}, function(error) {
										if(error) {
											alert(error);
										} else {
											result = true;
										}
									});
								}
							});
						}
					});
				}
			});
		} else {
			result = false;
		}
		return result;
	},
	rename: function(id, name, check, type) {
		var result;
		var originalInstance = Instances.findOne({
			_id: id
		});
		var hasAccess = false;
		var originalName = originalInstance.tablename;
		if(type == 0) {
			hasAccess = (check == "QuestionTool2015");
		} else if(type == 1) {
			hasAccess = (check == originalInstance.password);
		} else if(type == 2) {
			hasAccess = (check == originalInstance.admin);
		}
		if(hasAccess) {
			Instances.update({
				_id: id
			}, {
				$set: {
					tablename: name
				}
			}, function(error, count, status) {
				if(!error) {
					Questions.update({
						tablename: originalName
					}, {
						$set: {
							tablename: name
						}
					}, {
						multi: true
					}, function(error, count, status) {
						if(!error) {
							Answers.update({
								tablename: originalName
							}, {
								$set: {
									tablename: name
								}
							}, {
								multi: true
							}, function(error, count, status) {
								if(!error) {
									Votes.update({
										tablename: originalName
									}, {
										$set: {
											tablename: name
										}
									}, {
										multi: true
									},function(error, count, status) {
										if(!error) {
											result = true;
										}
									});
								}
							});
						}
					});
				}
			});
		} else {
			result = false;;
		}
		return name;
	},
	// Method that registers a vote on a question
	vote: function(id, ip, tablename) {
		var keys = "";
		// Ensures that the user hasn't already voted from their IP address
		var votes = Votes.find({
			qid: id,
			ip: ip
		});
		if(votes.fetch().length == 0) {
			// If they haven't voted, increment the given quesiton's vote # by 1 and update the lasttouch
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
					// If error, set keys to the error object
					keys = error;
				} else {
					// If successful, insert vote into the votes DB
					Votes.insert({
						qid: id, 
						ip: ip, 
						tablename: tablename,
					}, function(error, id) {
						if(error) {
							// If error, set keys to the error object
							keys = error;
						}
					});
				}				
			});
		}
		return keys;
	},
	// Method that hides (sets state to disabled) a question with given ID
	hide: function(email, id) {
		var question = Questions.findOne({
			_id: id
		});
		var table = Instances.findOne({
			tablename: question.tablename
		});
		if(email !== table.admin) {
			if(table.moderators) {
				if(table.moderators.indexOf(email) == -1) {
					return false;
				}
			}
		}
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
	},
	addFavorite: function(id) {
		if(Meteor.user()) {
			Meteor.users.update({
				_id: Meteor.user()._id
			}, { 
				$push: {
					"profile.favorites": id
				}
			});
		} else {
			return false;
		}
		return true;
	},
	removeFavorite: function(id) {
		if(Meteor.user()) {
			Meteor.users.update({
				_id: Meteor.user()._id
			}, { 
				$pull: {
					"profile.favorites": id
				}
			});
		} else {
			return false;
		}
		return true;
	}
});
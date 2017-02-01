/* eslint-disable no-unused-vars, camelcase */

import { Answers, Questions, Instances, Votes } from '../lib/common.js';

Meteor.methods({
  // A method that returns the current connection's IP address
  getIP() {
    return this.connection.clientAddress;
  },
  // A method that checks whether the user has a valid cookie
  cookieCheck(cookie) {
    return cookie !== null;
  },
  // A method that returns a table given a tablename
  getTable(tablename) {
    return Instances.findOne({
      tablename: {
        $regex: new RegExp('^' + tablename, 'i'),
      },
    });
  },
  // A method that checks whether a table exists with parameter tablename
  listCookieCheck(instanceid) {
    const table = Instances.findOne({
      _id: instanceid,
    });
    return table !== undefined;
  },
  // A method that checks whether the email matches the admin of the supplied tablename
  adminCheck(instanceid) {
    let user;
    const table = Instances.findOne({ _id: instanceid });
    if (table === undefined) { return false; }
    if (this.userId) {
      user = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
    } else {
      return false;
    }
    return ((user === table.admin) || (table.moderators.indexOf(user) !== -1));
  },
  touch(instanceid) {
    Instances.update(
      { _id: instanceid },
      { $set: { lasttouch: new Date().getTime() - 1000 } }
    );
  },
  sendEmail(to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to,
      from,
      subject,
      text,
    });
  },
  // A method that adds an answer to the databases
  answer(instanceid, answer, questionID, anonymous) {
    let keys = '';
    answer.replace(/<(?:.|\n)*?>/gm, '');
    // Retrieves the current quesetion from the DB (if one exists)
    let posterName;
    let email;

    if (!anonymous && this.userId) {
      const usr = Meteor.users.findOne({ _id: this.userId });
      posterName = usr.profile.name;
      email = usr.emails[0].address;
    } else {
      anonymous = true;
      posterName = 'Anonymous';
    }
    const inst = Instances.findOne({ _id: instanceid });

    if (!inst.anonymous && anonymous) {
      return [{ name: 'anonymous' }];
    }

    const question = Questions.findOne({
      _id: questionID,
    });
    if (question === undefined) {
      return false;
    }
    // Inserts the answer into the answer databse
    Answers.insert({
      text: answer,
      poster: posterName,
      email,
      ip: this.connection.clientAddress,
      instanceid,
      qid: question._id,
      timeorder: new Date().getTime() - 1000,
    }, (error, id) => {
      // If error, set keys to the error object
      if (error) {
        keys = error.invalidKeys;
      } else {
        // If successful, update lasttouch of the question
        Questions.update({
          _id: question._id,
        }, {
          $set: {
            lasttouch: new Date().getTime() - 1000,
          },
        }, (e, count, status) => {
          if (e) {
            return false;
          }
          Instances.update({
            instanceid,
          }, {
            $set: {
              lasttouch: new Date().getTime() - 1000,
            },
          }, (er, c, st) => {
            if (er) {
              keys = er.invalidKeys;
            }
          });
        });
      }
    });
    // Return keys (will be error.invalidKeys array if error exists)
    return keys;
  },
  // A method that adds an instance to the databases
  create(tablename, threshold, newLength, stale, description, mods, maxQuestion, maxResponse, anonymous, isHidden) {
    const usr = Meteor.users.findOne({ _id: this.userId });
    if (usr === undefined) {
      return false;
    }
    let keys;
    const table_id = Instances.insert({
      tablename,
      threshold,
      new_length: newLength,
      stale_length: stale,
      description,
      moderators: mods,
      lasttouch: new Date().getTime() - 1000,
      admin: usr.emails[0].address,
      max_question: maxQuestion,
      max_response: maxResponse,
      anonymous,
      hidden: isHidden,
      author: usr.profile.name,
    }, (error, id) => {
      // If error, set keys to the error object
      if (error) {
        keys = error.invalidKeys;
      }
    });
    if (keys) {
      return keys;
    }
    Questions.insert({
      instanceid: table_id,
      tablename,
      text: "Welcome to the Q&A tool. Please post on this instance. Vote by clicking on the upvote icon to raise a post's prominence. Reply or share a post on facebook and twitter by clicking on the respective icons.",
      poster: 'the system',
      timeorder: new Date().getTime() - 1000,
      lasttouch: new Date().getTime() - 1000,
      state: 'normal',
      votes: 0,
    }, (e, identification) => {
      // If error, set keys to the error object
      if (e) {
        keys = e.invalidKeys;
      }
    });
    // If error (keys is defined), return the keys (error.invalidKeys) object
    if (keys) {
      return keys;
    }
    return Instances.findOne({ _id: table_id }).slug;
  },
  // Method that unhides every question in a given table
  unhide(instanceid) {
    if (this.userId) {
      let keys;
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const instance = Instances.findOne({
        _id: instanceid,
      });
      if (email === instance.admin || instance.moderators.indexOf(email) !== -1) {
        // Sets state to normal for every question with tablename table
        Questions.update({
          instanceid,
        }, {
          $set: {
            state: 'normal',
          },
        }, {
          multi: true,
        }, (error, count, status) => {
          if (error) {
            keys = error.invalidKeys;
          }
        });
        if (keys) {
          return keys;
        }
        return true;
      }
      return false;
    }
    return false;
  },
  unhideThis(id) {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const question = Questions.findOne({
        _id: id,
      });
      const table = Instances.findOne({
        _id: question.instanceid,
      });
      if (email !== table.admin && table.moderators && table.moderators.indexOf(email) === -1) {
        return false;
      }
      Questions.update({
        _id: id,
      }, {
        $set: {
          state: 'normal',
        },
      }, (error, count, status) => {
        if (!error) {
          return true;
        }
        return false;
      });
    }
    return false;
  },
  addMods(mods, instanceid) {
    if (this.userId) {
      let keys;
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const instance = Instances.findOne({
        _id: instanceid,
      });
      if (email === instance.admin) {
        Instances.update({
          _id: instanceid,
        }, {
          $push: {
            moderators: {
              $each: mods,
            },
          },
        }, (error, count, status) => {
          if (error) {
            keys = error.invalidKeys;
          }
        });
      } else {
        return false;
      }
      if (keys) {
        return keys;
      }
      return true;
    }
    return false;
  },
  removeMods(mod, instanceid) {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const instance = Instances.findOne({
        _id: instanceid,
      });
      if (email === instance.admin) {
        Instances.update({
          _id: instanceid,
        }, {
          $pull: {
            moderators: mod,
          },
        }, (error, count, status) => {
          if (error) {
            return false;
          }
        });
      } else {
        return false;
      }
      return true;
    }
    return false;
  },
  canModify(question) {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const quest = Questions.findOne({ _id: question });
      return quest.email === email && quest.posterLoggedIn;
    }
    return false;
  },
  // Method that modifies a question
  modify(question, id) {
    let keys;
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const quest = Questions.findOne({ _id: id });
      const instanceid = quest.instanceid;
      const instance = Instances.findOne({
        _id: instanceid,
      });

      if (!email || !instance || !instance.admin || !quest) { return false; }
      if (email !== instance.admin && (instance.moderators.indexOf(email) === -1) && (quest.email !== email || !quest.posterLoggedIn)) {
        return false;
      }

      Questions.update({
        _id: id,
      }, {
        $set: {
          lasttouch: new Date().getTime() - 1000,
          text: question,
        },
      }, (error, count, status) => {
        if (error) {
          keys = error.invalidKeys;
        }
      });
      if (keys) {
        return keys;
      }
      return true;
    }
    return false;
  },
  // Method that combines two questions and answers
  combine(question, id1, id2) {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      // Checks whether the user has proper admin privileges
      const q1 = Questions.findOne({ _id: id1 });
      const q2 = Questions.findOne({ _id: id2 });
      if (q1.instanceid !== q2.instanceid) { return false; }
      const instanceid = q1.instanceid;
      const instance = Instances.findOne({
        _id: instanceid,
      });
      if (email !== instance.admin && instance.moderators.indexOf(email) === -1) {
        return false;
      }
      let keys;
      // Updates the text of the FIRST question
      Questions.update({ _id: id1 },
        {
          $set: { lasttouch: new Date().getTime() - 1000, text: question },
        }, (error, count, status) => {
          if (error) {
            keys = error.invalidKeys;
          }
        }
      );
      if (keys) {
        return keys;
      }
      Answers.update({ qid: id2 }, { $set: { qid: id1 } }, { multi: true });
      const votes = Votes.aggregate([
        { $match: { qid: { $in: [id1, id2] } } },
        { $group: { _id: '$ip' } },
      ]);
      Votes.remove({ qid: id1 });
      Array.from(votes).forEach((ip) => {
        Votes.insert({ qid: id1, ip: ip._id, instanceid });
      });
      Questions.update({ _id: id1 }, { $set: { votes: votes.length } });
      Questions.update({ _id: id2 }, { $set: { state: 'disabled' } });
    }
    return false;
  },
  // Method that adds a new question to the database
  propose(instanceid, tablename, question, anonymous, pName, pEmail) {
    let keys;
    question.replace(/<(?:.|\n)*?>/gm, '');
    let posterName;
    let posterEmail;
    let logged_in = false;
    if (!anonymous && this.userId) {
      logged_in = true;
      const usr = Meteor.users.findOne({ _id: this.userId });
      posterName = usr.profile.name;
      posterEmail = usr.emails[0].address;
    } else if (anonymous || (!anonymous && (!pName && !pEmail))) {
      anonymous = true;
      posterName = 'Anonymous';
      posterEmail = '';
    } else if (!anonymous && (pName && pEmail)) {
      posterName = pName;
      posterEmail = pEmail;
    }
    // Gets the current table
    const table = Instances.findOne({
      _id: instanceid,
    });
    if (table === null) {
      return false;
    } else if (!table.anonymous && anonymous) {
      return [{ name: 'anonymous' }];
    }
    // Update the lasttouch of the Instance
    Questions.insert({
      instanceid,
      tablename,
      text: question,
      posterLoggedIn: logged_in,
      poster: posterName,
      email: posterEmail,
      ip: this.connection.clientAddress,
      timeorder: new Date().getTime() - 1000,
      lasttouch: new Date().getTime() - 1000,
      state: 'normal',
      votes: 0,
    }, (error, id) => {
      if (error) {
        // If error, store object in keys variable
        keys = error.invalidKeys;
      } else {
        Instances.update({
          _id: table._id,
        }, {
          $set: {
            lasttouch: new Date().getTime() - 1000,
          },
        }, (e, c, st) => {
          if (e) {
            keys = e.invalidKeys;
          }
        });
      }
    });
    return keys;
  },
  // Method that removes a table from the database
  remove(instanceid) {
    if (Meteor.user()) {
      const email = Meteor.user().emails[0].address;
      // Ensures that the user has proper admin privileges
      const instance = Instances.findOne({
        _id: instanceid,
      });
      // Removes all questions with the given tablename
      if (email !== instance.admin) {
        return false;
      }
      Questions.remove({
        instanceid,
      }, (error) => {
        if (!error) {
          // If successful, removes all answers with the given tablename
          Answers.remove({
            instanceid,
          }, (e) => {
            if (!e) {
              // If successful, remove the instance with the given tablename
              Instances.remove({
                _id: instanceid,
              }, (er) => {
                if (!er) {
                  // If successful, remove all votes with the given tablename
                  Votes.remove({
                    instanceid,
                  }, (err) => {
                    if (!err) {
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
    return false;
  },
  adminRemove(instanceid) {
    // Ensures that the user has proper admin privileges
    if (Meteor.user()) {
      let result;
      let hasAccess = false;
      const email = Meteor.user().emails[0].address;
      const table = Instances.findOne({
        _id: instanceid,
      });
      if (email && (email === table.admin || email === process.env.SUPERADMIN_EMAIL)) {
        hasAccess = true;
      }
      if (hasAccess) {
        // Removes all of the questions with the given table ID
        Questions.remove({
          instanceid,
        }, (error) => {
          if (!error) {
            // If successful, removes all answers with the given tablename
            Answers.remove({
              instanceid,
            }, (e) => {
              if (!e) {
                // If successful, remove the instance with the given tablename
                Instances.remove({
                  _id: instanceid,
                }, (er) => {
                  if (!er) {
                    // If successful, remove all votes with the given tablename
                    Votes.remove({
                      tablename: table.tablename,
                    }, (err) => {
                      if (!err) {
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
    }
    return false;
  },
  rename(id, name, desc) {
    if (Meteor.user()) {
      let result;
      let hasAccess = false;
      const email = Meteor.user().emails[0].address;
      const originalInstance = Instances.findOne({
        _id: id,
      });
      const originalName = originalInstance.tablename;
      if (email && (email === originalInstance.admin || email === process.env.SUPERADMIN_EMAIL)) {
        hasAccess = true;
      }
      if (hasAccess) {
        Instances.update({
          _id: id,
        }, {
          $set: {
            tablename: name,
            description: desc,
          },
        }, (error, count, status) => {
          if (!error) {
            Questions.update({
              instanceid: id,
            }, {
              $set: {
                tablename: name,
              },
            }, {
              multi: true,
            });
          }
        });
      } else {
        return 2;
      }
    }
    return false;
  },
  // Method that registers a vote on a question
  vote(questionid, instanceid) {
    let keys = '';
    const ip = this.connection.clientAddress;
    // Ensures that the user hasn't already voted from their IP address
    const votes = Votes.find({
      qid: questionid,
      ip,
    });
    if (votes.fetch().length === 0) {
      // If they haven't voted, increment the given quesiton's vote # by 1 and update the lasttouch
      Questions.update({
        _id: questionid,
      }, {
        $set: {
          lasttouch: new Date().getTime() - 1000,
        },
        $inc: {
          votes: 1,
        },
      }, (error, count, status) => {
        if (error) {
          // If error, set keys to the error object
          keys = error;
        } else {
          // If successful, insert vote into the votes DB
          Votes.insert({
            qid: questionid,
            ip,
            instanceid,
          }, (e, id) => {
            if (e) {
              // If error, set keys to the error object
              keys = e;
            }
          });
        }
      });
    } else {
      keys = 'votedbefore';
    }
    return keys;
  },
  // Method that hides (sets state to disabled) a question with given ID
  hide(id) {
    if (Meteor.user()) {
      const email = Meteor.user().emails[0].address;
      const question = Questions.findOne({
        _id: id,
      });
      const table = Instances.findOne({
        _id: question.instanceid,
      });
      if (email !== table.admin && table.moderators && table.moderators.indexOf(email) === -1) {
        return false;
      }
      Questions.update({
        _id: id,
      }, {
        $set: {
          state: 'disabled',
        },
      }, (error, count, status) => {
        if (error) {
          return false;
        }
      });
    }
    return false;
  },
  addFavorite(id) {
    if (Meteor.user()) {
      Meteor.users.update({
        _id: Meteor.user()._id,
      }, {
        $push: {
          'profile.favorites': id,
        },
      });
    } else {
      return false;
    }
    return true;
  },
  removeFavorite(id) {
    if (Meteor.user()) {
      Meteor.users.update({
        _id: Meteor.user()._id,
      }, {
        $pull: {
          'profile.favorites': id,
        },
      });
    } else {
      return false;
    }
    return true;
  },
  superadmin() {
    if (Meteor.user()) {
      const email = Meteor.user().emails[0].address;
      return email === process.env.SUPERADMIN_EMAIL;
    }
    return false;
  },
  register(email, password, profileName) {
    const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,253}[a-zA-Z0-9])?)*$/i;
    if (!email || !profileName) {
      return 1;
    } else if (!re.test(email)) {
      return 2;
    } else if (Meteor.users.findOne({ 'emails.address': email })) {
      return 3;
    } else if (profileName.length > 30) {
      return 4;
    } else if (email.length > 50 || email.length < 7) {
      return 5;
    } else if (password.length > 30 || password.length < 6) {
      return 6;
    }
    return Accounts.createUser({
      email,
      password,
      profile: {
        name: profileName,
      },
    });
  },
});

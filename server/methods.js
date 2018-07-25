/* eslint-disable no-unused-vars, camelcase */

import { _ } from 'underscore';
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
      social: true,
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
  editadv(instanceid, newValues) {
    if (_.isUndefined(this.userId)) {
      return false;
    }
    const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
    const instance = Instances.findOne({
      _id: instanceid,
    });
    if (email === instance.admin || instance.moderators.indexOf(email) !== -1) {
      Instances.update({
        _id: instanceid,
      }, {
        $set: newValues,
      }, (error, count, status) => {
        if (error) {
          errorKey = error.invalidKeys[0].name;
          throw new Meteor.Error(errorKey);
        }
      });
      return true;
    }
    return false;
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
      const inst = Instances.findOne({ _id: quest.instanceid });
      return (quest.email === email && quest.posterLoggedIn) || email === inst.admin || inst.moderators.indexOf(email) !== -1;
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
  propose(instanceid, question, anonymous, pName, pEmail) {
    let keys;
    question.replace(/<(?:.|\n)*?>/gm, '');
    let posterName;
    let posterEmail;
    let logged_in = false;
    if (!anonymous) {
      if (this.userId) {
        logged_in = true;
        const usr = Meteor.users.findOne({ _id: this.userId });
        posterName = usr.profile.name;
        posterEmail = usr.emails[0].address;
      } else if (!pName || !pEmail) {
        anonymous = true;
      } else {
        posterName = pName;
        posterEmail = pEmail;
      }
    }
    const table = Instances.findOne({ _id: instanceid });
    if (anonymous) {
      posterName = 'Anonymous';
      if (table === null) {
        return false;
      } else if (!table.anonymous) {
        return [{ name: 'anonymous' }];
      }
    }
    // Update the lasttouch of the Instance
    Questions.insert({
      instanceid,
      tablename: table.tablename,
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
  adminRemove(instanceid) {
    // Ensures that the user has proper admin privileges
    if (this.userId) {
      let result;
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const table = Instances.findOne({
        _id: instanceid,
      });
      if (!table) { return false; }
      if (email && (email === table.admin || email === process.env.SUPERADMIN_EMAIL)) {
        const i_r = Instances.remove({ _id: instanceid });
        if (i_r !== 1) { return false; }

        const q_num = Questions.find({ instanceid }).count();
        const q_r = Questions.remove({ instanceid });
        if (q_num > q_r) { return false; }

        const v_num = Votes.find({ instanceid }).count();
        const v_r = Votes.remove({ instanceid });
        if (v_num > v_r) { return false; }

        const a_num = Answers.find({ instanceid }).count();
        const a_r = Answers.remove({ instanceid });
        if (a_num > a_r) { return false; }

        return true;
      }
      return false;
    }
    return false;
  },
  rename(id, name, desc) {
    if (this.userId) {
      let result;
      let keys;
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const originalInstance = Instances.findOne({
        _id: id,
      });
      const originalName = originalInstance.tablename;
      if (email && (email === originalInstance.admin || email === process.env.SUPERADMIN_EMAIL)) {
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
          } else {
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
  // Method that registers a vote on a question
  vote(questionid) {
    let keys;
    const ip = this.connection.clientAddress;
    // Ensures that the user hasn't already voted from their IP address
    let votes;

    if (this.userId) {
      votes = Votes.findOne({ $or: [{ qid: questionid, ip }, { qid: questionid, uid: this.userId }] });
    } else {
      votes = Votes.findOne({ qid: questionid, ip });
    }

    if (!votes) {
      const instanceid = Questions.findOne({ _id: questionid }).instanceid;
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
            uid: this.userId,
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
      keys = [{ name: 'votedbefore' }];
    }
    if (keys) {
      return keys;
    }
    return true;
  },
  // Method that hides (sets state to disabled) a question with given ID
  hideThis(id) {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      const question = Questions.findOne({ _id: id });
      const table = Instances.findOne({ _id: question.instanceid });
      let success = true;
      if (email === table.admin || (table.moderators && table.moderators.indexOf(email) !== -1)) {
        Questions.update({ _id: id }, { $set: { state: 'disabled' } }, (error, count, status) => {
          if (error) {
            success = false;
          }
        });
        return success;
      }
      return false;
    }
    return false;
  },
  addFavorite(id) {
    if (this.userId) {
      let success = true;
      const faves = Meteor.users.findOne({ _id: this.userId }).profile.favorites;
      if (!Instances.findOne({ _id: id })) { return false; }
      if (faves && faves.indexOf(id) !== -1) { return false; }
      Meteor.users.update({ _id: this.userId }, { $push: { 'profile.favorites': id } }, (error, count, status) => {
        if (error) {
          success = false;
        }
      });
      return success;
    }
    return false;
  },
  removeFavorite(id) {
    if (this.userId) {
      let success = true;
      Meteor.users.update({ _id: this.userId }, { $pull: { 'profile.favorites': id } }, (error, count, status) => {
        if (error) {
          success = false;
        }
      });
      return success;
    }
    return false;
  },
  superadmin() {
    if (this.userId) {
      const email = Meteor.users.findOne({ _id: this.userId }).emails[0].address;
      return email === process.env.SUPERADMIN_EMAIL;
    }
    return false;
  },
  register(email, password, profileName) {
    if (this.userId) { return false; }
    const system_names = ['thesystem', 'system'];
    const alphanumeric_name = profileName.replace(/[^a-z0-9]/gi, '');
    const re_name = /^[a-z0-9-_\s]+$/i;
    const re_email = SimpleSchema.RegEx.Email;
    if (!profileName || !email || !password) {
      return [{ name: 'missingfield' }];
    } else if (system_names.indexOf(alphanumeric_name.toLowerCase()) !== -1) {
      return [{ name: 'systemname' }];
    } else if (!re_email.test(email) || email.length > 30 || email.length < 7) {
      return [{ name: 'email' }];
    } else if (Accounts.findUserByEmail(email)) {
      return [{ name: 'exists' }];
    } else if (profileName.length > 30 || !re_name.test(profileName)) {
      return [{ name: 'name' }];
    } else if (alphanumeric_name.length === 0) {
      return [{ name: 'alphanumeric' }];
    } else if (password.length > 30 || password.length < 6) {
      return [{ name: 'password' }];
    }

    return Accounts.createUser({ email, password, profile: { name: profileName } });
  },
});

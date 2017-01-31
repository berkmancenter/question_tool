/* eslint-env mocha  */
/* eslint-disable prefer-arrow-callback, func-names, camelcase */

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Instances, Questions, Answers } from '/lib/common.js';
import './methods.js';

if (Meteor.isServer) {
  describe('Methods', function () {
    const test_admin = {
      email: 'admin@admins.us',
      password: Random.hexString(10),
      profile: {
        name: 'Ms. Admin',
      },
    };

    const test_mod = {
      email: 'mod@mods.us',
      password: Random.hexString(10),
      profile: {
        name: 'Mod McMod',
      },
    };

    const test_user = {
      email: 'user@users.us',
      password: Random.hexString(10),
      profile: {
        name: 'User McUser',
      },
    };

    const test_table = {
      tablename: Random.hexString(10),
      threshold: 2,
      new_length: 30,
      stale_length: 900,
      max_question: 250,
      max_response: 200,
      description: Random.hexString(300),
      moderators: [test_mod.email],
      lasttouch: new Date().getTime() - 1000,
      admin: test_admin.email,
      anonymous: true,
      hidden: false,
      author: test_admin.profile.name,
    };

    const test_quest = {
      text: Random.hexString(20),
      poster: test_user.profile.name,
      email: test_user.email,
      ip: '127.0.0.1',
      posterLoggedIn: true,
      timeorder: new Date().getTime() - 1000,
      lasttouch: new Date().getTime() - 1000,
      state: 'normal',
      votes: 0,
    };

    const test_answer = {
      text: Random.hexString(200),
      poster: 'Anonymous',
      email: 'anon@anonymous.us',
      ip: '127.0.0.2',
      timeorder: new Date().getTime() - 1000,
    };

    const prep = function (options) {
      // options: users, question, answer

      this.test_table = Object.assign({}, test_table);
      const inst = Instances.insert(this.test_table);
      let quest;
      this.test_table._id = inst;

      if (options && options.users) {
        this.test_user = Object.assign({}, test_user);
        this.test_admin = Object.assign({}, test_admin);
        this.test_mod = Object.assign({}, test_mod);
        const uid = Accounts.createUser(this.test_user);
        const aid = Accounts.createUser(this.test_admin);
        const mid = Accounts.createUser(this.test_mod);
        this.test_user._id = uid;
        this.test_admin._id = aid;
        this.test_mod._id = mid;
      }

      if (options && options.question) {
        this.test_quest = Object.assign({}, test_quest);
        this.test_quest.instanceid = inst;
        this.test_quest.tablename = Instances.findOne({ _id: inst }).tablename;
        quest = Questions.insert(this.test_quest);
        this.test_quest._id = quest;
      }

      if (options && options.answer) {
        this.test_answer = Object.assign({}, test_answer);
        this.test_answer.instanceid = inst;
        this.test_answer.qid = quest;
      }
    };

    beforeEach(function () {
      resetDatabase();
    });

    describe('#getTable()', function () {
      it('should return the instance whose name is passed.', function () {
        prep.call(this);
        const table = Meteor.call('getTable', this.test_table.tablename);
        assert.equal(table._id, this.test_table._id);
      });

      it('should return same instance regardless of case.', function () {
        prep.call(this);
        const table_upper = Meteor.call('getTable', this.test_table.tablename.toUpperCase());
        const table_lower = Meteor.call('getTable', this.test_table.tablename.toLowerCase());
        assert.equal(table_upper._id, table_lower._id);
      });

      it('should return undefined if the instance does not exist.', function () {
        prep.call(this);
        const not_table = Meteor.call('getTable', this.test_table.tablename + 'not');
        assert.isUndefined(not_table);
      });
    });

    describe('#listCookieCheck()', function () {
      it('should return true if the table exists.', function () {
        prep.call(this);
        const present = Meteor.call('listCookieCheck', this.test_table._id);
        assert.isTrue(present);
      });

      it('should return false if the table does not exist.', function () {
        prep.call(this);
        const present = Meteor.call('listCookieCheck', this.test_table._id + 'not');
        assert.isFalse(present);
      });
    });

    describe('#adminCheck()', function () {
      const adminCheck = Meteor.server.method_handlers.adminCheck;
      it('should return true if logged in user is the admin of an instance.', function () {
        prep.call(this, { users: true });
        const is_admin = adminCheck.apply({ userId: this.test_admin._id }, [this.test_table._id]);
        assert.isTrue(is_admin);
      });

      it('should return true if logged in user is a moderator of an instance.', function () {
        prep.call(this, { users: true });
        const is_mod = adminCheck.apply({ userId: this.test_mod._id }, [this.test_table._id]);
        assert.isTrue(is_mod);
      });

      it('should return false if the instance does not exist.', function () {
        prep.call(this, { users: true });
        const is_admin = adminCheck.apply({ userId: this.test_admin._id }, [this.test_table._id + 'not']);
        assert.isFalse(is_admin);
      });

      it('should return false if user is neither an admin nor a moderator of an instance.', function () {
        prep.call(this, { users: true });
        const is_admin_mod = adminCheck.apply({ userId: this.test_user._id }, [this.test_table._id]);
        assert.isFalse(is_admin_mod);
      });

      it('should return false if no user is logged in.', function () {
        prep.call(this);
        const is_admin_mod = adminCheck.apply({}, [this.test_table._id]);
        assert.isFalse(is_admin_mod);
      });
    });

    describe('#touch()', function () {
      it('should update an instance\'s lasttouch to now.', function () {
        prep.call(this);
        Meteor.call('touch', this.test_table._id);
        const new_touch = Instances.findOne({ _id: this.test_table._id }).lasttouch;
        assert.isAbove(new_touch, this.test_table.lasttouch);
      });
    });

    describe('#answer()', function () {
      const answer = Meteor.server.method_handlers.answer;
      const invocation = function (anon) {
        const res = { connection: { clientAddress: this.test_answer.ip } };
        if (!anon) { res.userId = this.test_user._id; }
        return res;
      };

      it('should add an answer to a pre-existing question.', function () {
        prep.call(this, { question: true, answer: true, users: true });
        answer.apply(invocation.call(this, false), [this.test_table._id, this.test_answer.text, this.test_quest._id, false]);
        assert.equal(Answers.find({ qid: this.test_quest._id }).count(), 1);
      });

      it('should return false if the question does not exist.', function () {
        prep.call(this, { question: true, answer: true, users: true });
        const res = answer.apply(invocation.call(this, false), [this.test_table._id, this.test_answer.text, this.test_quest._id + 'not', false]);
        assert.isFalse(res);
      });

      it('should return an error if answer is too long.', function () {
        prep.call(this, { question: true, answer: true, users: true });
        const long_ans = Random.hexString(300);
        const error = answer.apply(invocation.call(this, false), [this.test_table._id, long_ans, this.test_quest._id, false]);
        assert.isArray(error);
        assert.equal(error[0].name, 'text');
      });

      it('should post answer as anonymous if the logged in user specifies it.', function () {
        prep.call(this, { question: true, answer: true, users: true });
        answer.apply(invocation.call(this, false), [this.test_table._id, this.test_answer.text, this.test_quest._id, true]);
        const ans = Answers.findOne({ qid: this.test_quest._id });
        assert.equal(ans.poster, 'Anonymous');
        assert.isUndefined(ans.email);
      });

      it('should post answer as anonymous if the user is not logged in.', function () {
        prep.call(this, { question: true, answer: true });
        answer.apply(invocation.call(this, true), [this.test_table._id, this.test_answer.text, this.test_quest._id, false]);
        const ans = Answers.findOne({ qid: this.test_quest._id });
        assert.equal(ans.poster, 'Anonymous');
        assert.isUndefined(ans.email);
      });
    });

    describe('#create()', function () {
      const create = Meteor.server.method_handlers.create;

      it('should create a new instance and return its ID if all the fields are correct.', function () {
        prep.call(this, { users: true });
        this.t = Object.assign({}, this.test_table);
        const created = create.apply({ userId: this.test_user._id }, [this.t.tablename, this.t.threshold, this.t.new_length, this.t.stale_length, this.t.description, this.t.moderators, this.t.max_question, this.t.max_response, this.t.anonymous, this.t.hidden]);
        assert.isString(created);
      });

      it('should return false if no user is logged in.', function () {
        prep.call(this);
        this.t = Object.assign({}, this.test_table);
        const created = create.apply({}, [this.t.tablename, this.t.threshold, this.t.new_length, this.t.stale_length, this.t.description, this.t.moderators, this.t.max_question, this.t.max_response, this.t.anonymous, this.t.hidden]);
        assert.isFalse(created);
      });

      it('should return an error if more than 4 moderators are registered.', function () {
        prep.call(this, { users: true });
        this.t = Object.assign({}, this.test_table);
        const mods = [];
        for (let i = 0; i < 5; i++) {
          mods.push(this.test_mod.email);
        }
        const created = create.apply({ userId: this.test_user._id }, [this.t.tablename, this.t.threshold, this.t.new_length, this.t.stale_length, this.t.description, mods, this.t.max_question, this.t.max_response, this.t.anonymous, this.t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'moderators');
      });

      it('should return an error if the tablename doesn\'t contains non-alphanumeric chars.', function () {
        prep.call(this, { users: true });
        this.t = Object.assign({}, this.test_table);
        const created = create.apply({ userId: this.test_user._id }, [this.t.tablename + '-', this.t.threshold, this.t.new_length, this.t.stale_length, this.t.description, this.t.moderators, this.t.max_question, this.t.max_response, this.t.anonymous, this.t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'tablename');
      });

      it('should return an error if the description is more than 500 chars.', function () {
        prep.call(this, { users: true });
        this.t = Object.assign({}, this.test_table);
        const created = create.apply({ userId: this.test_user._id }, [this.t.tablename, this.t.threshold, this.t.new_length, this.t.stale_length, Random.hexString(501), this.t.moderators, this.t.max_question, this.t.max_response, this.t.anonymous, this.t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'description');
      });
    });

    describe('#unhide()', function () {
      const unhide = Meteor.server.method_handlers.unhide;

      const disable = function () {
        prep.call(this, { users: true, question: true });
        const temp_quest = Object.assign({}, this.test_quest);
        delete temp_quest._id;
        Questions.insert(temp_quest);
        Questions.update({ instanceid: this.test_table._id }, { $set: { state: 'disabled' } }, { multi: true });
      };

      it('should unhide all questions in an instance if the user is an admin.', function () {
        disable.call(this);
        unhide.apply({ userId: this.test_admin._id }, [this.test_table._id]);
        let all_visible = true;
        Questions.find({ instanceid: this.test_table._id }).forEach((question) => {
          if (question.state === 'disabled') {
            all_visible = false;
          }
        });
        assert.isTrue(all_visible);
      });

      it('should unhide all questions in an instance if the user is a mod.', function () {
        disable.call(this);
        unhide.apply({ userId: this.test_mod._id }, [this.test_table._id]);
        let all_visible = true;
        Questions.find({ instanceid: this.test_table._id }).forEach((question) => {
          if (question.state === 'disabled') {
            all_visible = false;
          }
        });
        assert.isTrue(all_visible);
      });

      it('should return false and not unhide any questions if the user is unauthorized.', function () {
        disable.call(this);
        const hidden_logged_in = unhide.apply({ userId: test_user._id }, [this.test_table._id]);
        let all_hidden_logged_in = true;
        Questions.find({ instanceid: this.test_table._id }).forEach((question) => {
          if (question.state !== 'disabled') {
            all_hidden_logged_in = false;
          }
        });
        assert.isFalse(hidden_logged_in);
        assert.isTrue(all_hidden_logged_in);
      });

      it('should return false and not unhide any questions if the user is logged out.', function () {
        disable.call(this);
        const hidden_logged_out = unhide.apply({}, [this.test_table._id]);
        let all_hidden_logged_out = true;
        Questions.find({ instanceid: this.test_table._id }).forEach((question) => {
          if (question.state !== 'disabled') {
            all_hidden_logged_out = false;
          }
        });
        assert.isFalse(hidden_logged_out);
        assert.isTrue(all_hidden_logged_out);
      });
    });

    describe('#unhideThis()', function () {
      const unhideThis = Meteor.server.method_handlers.unhideThis;

      const disable = function () {
        prep.call(this, { users: true, question: true });
        Questions.update({ _id: this.test_quest._id }, { $set: { state: 'disabled' } });
      };

      it('should unhide a question if the user is an admin.', function () {
        disable.call(this);
        unhideThis.apply({ userId: this.test_admin._id }, [this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).state, 'normal');
      });

      it('should unhide a question if the user is a mod.', function () {
        disable.call(this);
        unhideThis.apply({ userId: this.test_mod._id }, [this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).state, 'normal');
      });

      it('should return false and not unhide if the user is unauthorized.', function () {
        disable.call(this);
        const hidden_logged_in = unhideThis.apply({ userId: this.test_user._id }, [this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).state, 'disabled');
        assert.isFalse(hidden_logged_in);

        const hidden_logged_out = unhideThis.apply({}, [this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).state, 'disabled');
        assert.isFalse(hidden_logged_out);
      });
    });

    describe('#addMods()', function () {
      const mods = [];
      const addMods = Meteor.server.method_handlers.addMods;

      before(function () {
        for (let i = 0; i < 3; i++) {
          mods.push(Random.hexString(5) + '@mods.us');
        }
      });

      it('should add moderators if the user is an admin and fields are correct.', function () {
        prep.call(this, { users: true });
        const added = addMods.apply({ userId: this.test_admin._id }, [mods, this.test_table._id]);
        assert.isTrue(added);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 4);
      });

      it('should return false and not add moderators if the user is a mod.', function () {
        prep.call(this, { users: true });
        const added = addMods.apply({ userId: this.test_mod._id }, [mods, this.test_table._id]);
        assert.isFalse(added);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });

      it('should return false and not add moderators if the user is not logged in.', function () {
        prep.call(this);
        const added = addMods.apply({}, [mods, this.test_table._id]);
        assert.isFalse(added);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });

      it('should return false and not add moderators if the user is a regular user.', function () {
        prep.call(this, { users: true });
        const added = addMods.apply({ userId: this.test_user._id }, [mods, this.test_table._id]);
        assert.isFalse(added);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });

      it('should return an error and not add new mods if trying to make total moderators > 4.', function () {
        prep.call(this, { users: true });
        const extra_mods = mods.slice().push(Random.hexString(5) + '@mods.us');
        const error = addMods.apply({ userId: this.test_admin._id }, [extra_mods, this.test_table._id]);
        assert.isArray(error);
        assert.equal(error[0].name, 'moderators');
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });

      it('should return an error and not add new mods if any mod email is invalid.', function () {
        prep.call(this, { users: true });
        const invalid_mods = mods.slice();
        invalid_mods[0] = Random.hexString(10);
        const error = addMods.apply({ userId: this.test_admin._id }, [invalid_mods, this.test_table._id]);
        assert.isArray(error);
        assert.match(error[0].name, /^moderators*/);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });
    });

    describe('#removeMods()', function () {
      const removeMods = Meteor.server.method_handlers.removeMods;

      it('should remove a moderator if the user is an admin.', function () {
        prep.call(this, { users: true });
        removeMods.apply({ userId: this.test_admin._id }, [this.test_mod.email, this.test_table._id]);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 0);
      });

      it('should not remove a moderator if the user is a mod.', function () {
        prep.call(this, { users: true });
        removeMods.apply({ userId: this.test_mod._id }, [this.test_mod.email, this.test_table._id]);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });

      it('should not remove a moderator if the user is not logged in.', function () {
        prep.call(this, { users: true });
        removeMods.apply({}, [this.test_mod.email, this.test_table._id]);
        assert.equal(Instances.findOne({ _id: this.test_table._id }).moderators.length, 1);
      });
    });

    describe('#modify()', function () {
      const modify = Meteor.server.method_handlers.modify;
      const new_question = Random.hexString(20);

      it('should modify a question if instance admin.', function () {
        prep.call(this, { users: true, question: true });
        modify.apply({ userId: this.test_admin._id }, [new_question, this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).text, new_question);
      });

      it('should modify a question if instance mod.', function () {
        prep.call(this, { users: true, question: true });
        modify.apply({ userId: this.test_mod._id }, [new_question, this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).text, new_question);
      });

      it('should modify a question if user is the original poster.', function () {
        prep.call(this, { users: true, question: true });
        modify.apply({ userId: this.test_user._id }, [new_question, this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).text, new_question);
      });

      it('should not modify a question if user is unauthorized.', function () {
        prep.call(this, { question: true });
        const temp_id = Accounts.createUser({ email: 'temp@users.us', password: 'temptemptemptemp', profile: { name: 'Temp McTemple' } });
        modify.apply({ userId: temp_id }, [new_question, this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).text, this.test_quest.text);
      });

      it('should not modify a question if user is not logged in.', function () {
        prep.call(this, { question: true });
        modify.apply({}, [new_question, this.test_quest._id]);
        assert.equal(Questions.findOne({ _id: this.test_quest._id }).text, this.test_quest.text);
      });

      it('should return an error if modification puts question over char limit.', function () {
        prep.call(this, { users: true, question: true });
        const error = modify.apply({ userId: this.test_admin._id }, [Random.hexString(600), this.test_quest._id]);
        assert.isArray(error);
        assert.equal(error[0].name, 'text');
      });
    });
  });
}

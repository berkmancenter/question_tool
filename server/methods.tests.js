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

    const table_default = {
      threshold: 2,
      new_length: 30,
      stale_length: 900,
      max_question: 250,
      max_response: 200,
      anonymous: true,
      hidden: false,
    };

    const test_table = {
      tablename: Random.hexString(10),
      threshold: table_default.threshold,
      new_length: table_default.new_length,
      stale_length: table_default.stale_length,
      max_question: table_default.max_question,
      max_response: table_default.max_response,
      description: Random.hexString(300),
      moderators: [test_mod.email],
      lasttouch: new Date().getTime() - 1000,
      admin: test_admin.email,
      anonymous: table_default.anonymous,
      hidden: table_default.hidden,
      author: test_admin.profile.name,
    };

    const test_quest = {
      text: Random.hexString(20),
      poster: test_user.profile.name,
      email: test_user.email,
      ip: '127.0.0.1',
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

    before(function () {
      // 1. Clean out test database
      resetDatabase();

      // 2. Insert test data
      const uid = Accounts.createUser(test_user);
      const aid = Accounts.createUser(test_admin);
      const mid = Accounts.createUser(test_mod);
      test_user._id = uid;
      test_admin._id = aid;
      test_mod._id = mid;

      const inst = Instances.insert(test_table);
      test_table._id = inst;

      test_quest.instanceid = inst;
      test_quest.tablename = Instances.findOne({ _id: inst }).tablename;
      const quest = Questions.insert(test_quest);
      test_quest._id = quest;

      test_answer.instanceid = inst;
      test_answer.qid = quest;
    });

    describe('#getTable()', function () {
      it('should return the instance whose name is passed.', function () {
        const table = Meteor.call('getTable', test_table.tablename);
        assert.equal(table._id, test_table._id);
      });

      it('should return same instance regardless of case.', function () {
        const table_upper = Meteor.call('getTable', test_table.tablename.toUpperCase());
        const table_lower = Meteor.call('getTable', test_table.tablename.toLowerCase());
        assert.equal(table_upper._id, table_lower._id);
      });

      it('should return undefined if the instance does not exist.', function () {
        const not_table = Meteor.call('getTable', test_table.tablename + 'not');
        assert.isUndefined(not_table);
      });
    });

    describe('#listCookieCheck()', function () {
      it('should return true if the table exists.', function () {
        const present = Meteor.call('listCookieCheck', test_table._id);
        assert.isTrue(present);
      });

      it('should return false if the table does not exist.', function () {
        const present = Meteor.call('listCookieCheck', test_table._id + 'not');
        assert.isFalse(present);
      });
    });

    describe('#adminCheck()', function () {
      const adminCheck = Meteor.server.method_handlers.adminCheck;
      it('should return true if logged in user is the admin of an instance.', function () {
        const is_admin = adminCheck.apply({ userId: test_admin._id }, [test_table._id]);
        assert.isTrue(is_admin);
      });

      it('should return true if logged in user is a moderator of an instance.', function () {
        const is_mod = adminCheck.apply({ userId: test_mod._id }, [test_table._id]);
        assert.isTrue(is_mod);
      });

      it('should return false if the instance does not exist.', function () {
        const is_admin = adminCheck.apply({ userId: test_admin._id }, [test_table._id + 'not']);
        assert.isFalse(is_admin);
      });

      it('should return false if user is neither an admin nor a moderator of an instance.', function () {
        const is_admin_mod = adminCheck.apply({ userId: test_user._id }, [test_table._id]);
        assert.isFalse(is_admin_mod);
      });

      it('should return false if no user is logged in.', function () {
        const is_admin_mod = adminCheck.apply({}, [test_table._id]);
        assert.isFalse(is_admin_mod);
      });
    });

    describe('#touch()', function () {
      it('should update an instance\'s lasttouch to now.', function () {
        Meteor.call('touch', test_table._id);
        const new_touch = Instances.findOne({ _id: test_table._id }).lasttouch;
        assert.isAbove(new_touch, test_table.lasttouch);
        test_table.lasttouch = new_touch;
      });
    });

    describe('#answer()', function () {
      it('should add an answer to a pre-existing question.', function () {
        Meteor.call('answer', test_table._id, test_answer.text, test_user.profile.name, test_user.email, test_answer.ip, test_quest._id);
        assert.equal(Answers.find({ qid: test_quest._id }).count(), 1);
      });

      it('should return false if the question does not exist.', function () {
        const res = Meteor.call('answer', test_table._id, test_answer.text, test_user.profile.name, test_user.email, test_answer.ip, test_quest._id + 'not');
        assert.isFalse(res);
      });

      it('should return an error if answer is too long.', function () {
        const long_ans = Random.hexString(300);
        const error = Meteor.call('answer', test_table._id, long_ans, test_user.profile.name, test_user.email, test_answer.ip, test_quest._id);
        assert.isArray(error);
        assert.equal(error[0].name, 'text');
      });
    });

    describe('#create()', function () {
      const create = Meteor.server.method_handlers.create;
      const t = {
        tablename: Random.hexString(10),
        threshold: table_default.threshold,
        new_length: table_default.new_length,
        stale_length: table_default.stale_length,
        desc: Random.hexString(300),
        moderators: [],
        max_question: table_default.max_question,
        max_response: table_default.max_response,
        anonymous: table_default.anonymous,
        hidden: table_default.hidden,
      };

      it('shoud create a new instance and fill with a question if all the fields are correct.', function () {
        const created = create.apply({ userId: test_user._id }, [t.tablename, t.threshold, t.new_length, t.stale_length, t.desc, t.moderators, t.max_question, t.max_response, t.anonymous, t.hidden]);
        assert.equal(created, t.tablename);
        assert.equal(Instances.find({ tablename: created }).count(), 1);
        assert.equal(Questions.find({ tablename: created }).count(), 1);
      });

      it('should return false if no user is logged in.', function () {
        const created = create.apply({}, [t.tablename, t.threshold, t.new_length, t.stale_length, t.desc, t.moderators, t.max_question, t.max_response, t.anonymous, t.hidden]);
        assert.isFalse(created);
      });

      it('should return an error if more than 4 moderators are registered.', function () {
        const mods = [];
        for (let i = 0; i < 5; i++) {
          mods.push(test_mod.email);
        }
        const created = create.apply({ userId: test_user._id }, [t.tablename, t.threshold, t.new_length, t.stale_length, t.desc, mods, t.max_question, t.max_response, t.anonymous, t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'modlength');
      });

      it('should return an error if the tablename doesn\'t contains non-alphanumeric chars.', function () {
        const created = create.apply({ userId: test_user._id }, [t.tablename + '-', t.threshold, t.new_length, t.stale_length, t.desc, t.moderators, t.max_question, t.max_response, t.anonymous, t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'tablename');
      });

      it('should return an error if the description is more than 500 chars.', function () {
        const created = create.apply({ userId: test_user._id }, [t.tablename, t.threshold, t.new_length, t.stale_length, Random.hexString(501), t.moderators, t.max_question, t.max_response, t.anonymous, t.hidden]);
        assert.isArray(created);
        assert.equal(created[0].name, 'description');
      });
    });
  });
}

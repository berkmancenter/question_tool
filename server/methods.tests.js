/* eslint-env mocha  */
/* eslint-disable prefer-arrow-callback, func-names */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Instances, Questions, Answers } from '/lib/common.js';
import './methods.js';

if (Meteor.isServer) {
  describe('Methods', function () {
    before(function () {
      // 1. Clean out test database
      resetDatabase();

      // 2. Insert test data
      const inst = Instances.insert({
        tablename: 'testTable',
        threshold: 2,
        new_length: 30,
        stale_length: 900,
        max_question: 250,
        max_response: 200,
        description: 'a table to test',
        moderators: ['mod1@mods.us', 'mod2@mods.us'],
        lasttouch: new Date().getTime() - 1000,
        admin: 'admin@admins.us',
        anonymous: true,
        hidden: false,
        author: 'Ms. Admin',
      });

      const quest = Questions.insert({
        instanceid: inst,
        tablename: Instances.findOne({ _id: inst }).tablename,
        text: 'This is a question in the test table!',
        poster: 'Poster',
        email: 'poster@posters.us',
        ip: '127.0.0.1',
        timeorder: new Date().getTime() - 1000,
        lasttouch: new Date().getTime() - 1000,
        state: 'normal',
        votes: 0,
      });

      Answers.insert({
        text: 'This is an answer to the question in the test table!',
        poster: 'Replier',
        email: 'replier@repliers.us',
        ip: '127.0.0.2',
        instanceid: inst,
        qid: quest,
        timeorder: new Date().getTime() - 1000,
      });
    });

    describe('#getTable()', function () {
      it('should return the table/instance whose name is provided.', function () {
        const table = Meteor.call('getTable', 'testTable');
        assert.equal(table.tablename, 'testTable');
        assert.equal(table.description, 'a table to test');
      });
    });
  });
}

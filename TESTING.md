# Writing and Running Tests

## Tools:
We are currently using the `dispatch:mocha-phantomjs` package as a [driver package](https://guide.meteor.com/testing.html#driver-packages), with `practicalmeteor:chai` for assertion, as well as `xolvio:cleaner`, which allow us to:
- Use [Mocha](https://mochajs.org/) to write tests.
- Use [Chai](http://chaijs.com/) for assertion.
- Use [PhantomJS](http://phantomjs.org/) for front-end tests.
- Clear our test databases using [Xolv.io Cleaner](https://github.com/xolvio/cleaner).

## How to write a test:
The Meteor [docs](https://guide.meteor.com/testing.html#introduction) have a great introduction about different types of tests, but basically the general steps are:

1. Create a file that follows the test naming convention: \*.test[s].\* (e.g. `methods.tests.js`)
2. Include the required variables/methods from Meteor and/or npm packages. Example:

  ```javascript
    import { Meteor } from 'meteor/meteor';
    import { Random } from 'meteor/random';
    import { Accounts } from 'meteor/accounts-base';
    import { assert } from 'meteor/practicalmeteor:chai';
    import { resetDatabase } from 'meteor/xolvio:cleaner';
  ```
3. Import the file(s) we need to test (or use an exported variable from in our tests). Example:

  ```javascript
    // exported variables from /lib/common.js:
    import { Instances, Questions, Answers, Votes } from '/lib/common.js';
    // we are testing methods from ./methods.js:
    import './methods.js';
  ```
4. Specify where we want to run the test. Example:

  ```javascript
    if (Meteor.isServer) {
      // tests here
    }
  ```
5. Start writing tests using Mocha/Chai. Example:

  ```javascript
    describe('#something()', function () {
      it('should return something else.', function () {
        // this is the actual test
        assert.equal(something(), 'something else');
      });
    });
  ```
  
### Notes:
- Passing arrow functions to Mocha [is discouraged](https://mochajs.org/#arrow-functions).
- Tests run asynchronously, so don't depend on the result of another test in yours, and isolate the variables/database entries/clear the database between tests to ensure every test runs in the way/environment that you expect.

## Running Tests:
The test command is included in the app's [package.json](package.json). So you can just run: `npm test` in the app's directory and it will run all the tests once.
This will also run our "pretest" script, which runs ESLint. Read more about the code style guide, and what errors to expect from that [here](STYLEGUIDE.md).

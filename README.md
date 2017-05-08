# Question Tool

The question and answer tool is a real-time web application written in Meteor.js that allows anyone with a web browser and connection to the server to create a question/answer instance on a particular subject, propose a question, view other's questions, reply to questions and vote on questions on that particular subject.

For any server that is running the question tool software, any number of subject instances can be active at one time.  All users of an instance see any actions performed on the instance at the same time (voting, posting of questions or responses, etc) thanks to the magic of Meteor.js.

## Usage

The question tool was written to gather questions from an online audience and present them in a coherent and ordered way that communicates the communities interest in those questions by means of votes or responses.

The tool has various permission levels:

* Server Admin:	can rename or delete any instance, plus user privileges.
* Instance Admin: can unhide questions, add moderators, delete or rename instance, plus moderator privileges.
* Instance Moderator: can hide or merge	questions, plus	user privileges.
* Registered User: can create instances, can favorite instances.
* User: can post questions or replies as anonymous, pseudonymous, or signed.

By design, all instances are public - anyone with a web browser and connection to the server can view any instance, question or response, with the exception questions hidden by instance admins or moderators.

A user who is signed in can create an instance with a specific topic, after which web users can propose questions. Once the question is submitted, users can then vote on the question. Questions that are new, active or popular are pushed to the top. Users can also reply to questions.

## Installation

* Requirements: Mongo 2.6+, Node 0.10.36+

* Install

  * git clone the repo
  * build the meteor application

   ```meteor build {output_dir} --directory```
  * in the build directory, install node packages

   ```(cd programs/server && npm install)```
  * create the mongo db and add necessary permissions
  * run the app

   ```shell
   export MONGO_URL='mongodb://app_user:app_passwd@127.0.0.1:27017/app_db'
   export MONGO_OPLOG_URL=mongodb://oplog_user:oplog_passwd@127.0.0.1:27017/local?authSource=admin
   export ROOT_URL='https://your.url.here'
   export HTTP_FORWARDED_COUNT=1
   export PORT=8000
   export MAIL_URL='smtp://user:password@mailhost:port/'
   node main.js
   ```

* Setup

   Navigate to the /server/lib/startup.js file to set the email of the Question Tool superadmin (is able to delete/rename instances) and add a mail server URL for emailing. Superadmin must create a Question Tool account and be logged in with the specified email address for the superadmin priveleges.

## Contributing

1. Fork it! 
2. Check out the [code style guide](STYLEGUIDE.md).
3. Create your feature branch: `git checkout -b my-new-feature`
4. Commit your changes: `git commit -am 'Add some feature'`
5. [Write tests](TESTING.md) for your code and run other tests as well: `npm test`
6. Push to the branch: `git push origin my-new-feature`
7. Submit a pull request!

## History

The question tool has been used at the [Berkman Center for Internet & Society](https://cyber.law.harvard.edu "Berkman Center for Internet & Society") for over 10 years. It has been used at events, in class rooms, in forums, in meetings, any place where it is valuable to obtain community consensus over the topics that need to be pursued.

## Credits

* Nick Rubin - everything technical
* Jonathan Zittrain - the concept

## License

QuestionTool is licensed under the GPL

## Copyright

2015 President and Fellows of Harvard College

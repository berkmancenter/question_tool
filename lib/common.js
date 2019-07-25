// Initializes the Mongo collections
export const Instances = new Mongo.Collection('instances');
export const Questions = new Mongo.Collection('questions');
export const Answers = new Mongo.Collection('answers');
export const Votes = new Mongo.Collection('votes');
Instances.friendlySlugs('tablename');

// Initializes schemas for the database inputs
const Schemas = {};

Schemas.Instance = new SimpleSchema({
  tablename: {
    type: String,
    regEx: /^[0-9a-zA-Z \b]{4,30}$/ // Regular expression to accept string containing at least one letter and optionally is followed by number or space or any other letter.
  },
  threshold: {
    type: Number,
    allowedValues: [2, 4, 6, 8],
  },
  new_length: {
    type: Number,
    allowedValues: [30, 60, 300, 3600, 86400, 604800],
  },
  stale_length: {
    type: Number,
    allowedValues: [900, 1800, 3600, 86400, 604800, 2592000, 31557600],
  },
  max_question: {
    type: Number,
    allowedValues: [250, 300, 350, 400, 500],
  },
  max_response: {
    type: Number,
    allowedValues: [100, 150, 200, 250, 300],
  },
  description: {
    type: String,
    max: 500,
  },
  moderators: {
    type: Array,
    optional: true
  },
  'moderators.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  lasttouch: {
    type: Number,
  },
  order: {
    type: Number,
    optional: true,
  },
  admin: {
    type: String,
    optional: true,
  },
  anonymous: {
    type: Boolean,
    optional: true,
  },
  hidden: {
    type: Boolean,
    optional: true,
  },
  author: {
    type: String,
    optional: true,
  },
  social: {
    type: Boolean,
  },
});

Schemas.Question = new SimpleSchema({
  instanceid: {
    type: String,
    max: 30,
  },
  tablename: {
    type: String,
    regEx: /^[0-9a-zA-Z \b]{4,30}$/ // Regular expression to accept string containing at least one letter and optionally is followed by number or space or any other letter.
  },
  text: {
    type: String,
    max: 500,
    min: 10,
  },
  posterLoggedIn: {
    type: Boolean,
    optional: true,
  },
  poster: {
    type: String,
    optional: true,
    max: 30,
  },
  email: {
    type: String,
    optional: true,
    max: 70,
    regEx: SimpleSchema.RegEx.Email,
  },
  ip: {
    type: String,
    regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    optional: true,
  },
  timeorder: {
    type: Number,
  },
  lasttouch: {
    type: Number,
  },
  state: {
    type: String,
    max: 20,
  },
  votes: {
    type: Number,
    max: 9999,
  },
});

Schemas.Answer = new SimpleSchema({
  text: {
    type: String,
    max: 255,
  },
  poster: {
    type: String,
    optional: true,
    max: 30,
  },
  email: {
    type: String,
    optional: true,
    max: 70,
    regEx: SimpleSchema.RegEx.Email,
  },
  ip: {
    type: String,
    regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  },
  instanceid: {
    type: String,
    max: 30,
  },
  qid: {
    type: String,
    max: 30,
  },
  timeorder: {
    type: Number,
  },
});

Schemas.Vote = new SimpleSchema({
  qid: {
    type: String,
    max: 200,
  },
  ip: {
    type: String,
    regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  },
  instanceid: {
    type: String,
    max: 30,
  },
  uid: {
    type: String,
    optional: true,
  },
});

// Attaches the schemas to the collections
Instances.attachSchema(Schemas.Instance);
Questions.attachSchema(Schemas.Question);
Answers.attachSchema(Schemas.Answer);
Votes.attachSchema(Schemas.Vote);

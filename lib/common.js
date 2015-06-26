// Initializes the Mongo collections
Instances = new Mongo.Collection("instances");
Questions = new Mongo.Collection("questions");
Answers = new Mongo.Collection("answers");
Votes = new Mongo.Collection("votes");

// Initializes schemas for the database inputs
var Schemas = {};

Schemas.Instance = new SimpleSchema({
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/,
    },
    threshhold: {
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
    description: {
        type: String,
        optional: true,
        max: 255,
    },
    password: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,10}$/,
    },
	lasttouch: {
		type: Number
	}
});

Schemas.Question = new SimpleSchema({
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/
    },
    text: {
        type: String,
		max: 255,
		min: 6
    },
    poster: {
        type: String,
		optional: true,
		max: 30
    },
    email: {
        type: String,
		optional: true,
		max: 70,
		regEx: SimpleSchema.RegEx.Email
    },
    ip: {
        type: String,
        regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    },
	timeorder: {
        type: Number
    },
	lasttouch: {
        type: Number
    },
	state: {
        type: String,
        max: 20
    },
	votes: {
        type: Number,
		max: 9999
    },
});

Schemas.Answer = new SimpleSchema({
    text: {
        type: String,
        max: 255
    },
    poster: {
        type: String,
		optional: true,
		max: 30
    },
    email: {
        type: String,
        optional: true,
		max: 70,
		regEx: SimpleSchema.RegEx.Email
    },
    ip: {
        type: String,
        regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    },
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/
    },
    qid: {
        type: String,
        max: 30
    }
});

Schemas.Vote = new SimpleSchema({
    qid: {
        type: String,
        max: 200
    },
    ip: {
        type: String,
        regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/,
		optional: true
	}
});

// Attaches the schemas to the collections
Instances.attachSchema(Schemas.Instance);
Questions.attachSchema(Schemas.Question);
Answers.attachSchema(Schemas.Answer);
Votes.attachSchema(Schemas.Vote);
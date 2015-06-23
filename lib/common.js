Instances = new Mongo.Collection("instances");
Questions = new Mongo.Collection("questions");
Answers = new Mongo.Collection("answers");
Votes = new Mongo.Collection("votes");

var Schemas = {};

Schemas.Instance = new SimpleSchema({
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/
    },
    threshhold: {
        type: Number,
		allowedValues: [2, 4, 6, 8]		
    },
    new_length: {
        type: Number,
		allowedValues: [30, 60, 300, 3600, 86400, 604800]
    },
    stale_length: {
        type: Number,
		allowedValues: [900, 1800, 3600, 86400, 604800, 2592000, 31557600]
    },
    description: {
        type: String,
        optional: true,
        max: 255
    },
    password: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,10}$/
    }
});

Schemas.Question = new SimpleSchema({
    tablename: {
        type: String,
        regEx: /^[a-zA-Z0-9]{4,30}$/
    },
    text: {
        type: String,
    },
    poster: {
        type: String,
		optional: true,
		max: 30
    },
    email: {
        type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Email
    },
    ip: {
        type: String,
        regEx: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
	timeorder: {
        type: Number,
    },
	lasttouch: {
        type: Number,
    },
	state: {
        type: String,
        max: 10
    },
	votes: {
        type: Number,
        max: 5
    },
});

Schemas.Answer = new SimpleSchema({
    text: {
        type: String,
        max: 200
    },
    poster: {
        type: String,
    },
    email: {
        type: Number,
        min: 0
    },
    ip: {
        type: Date,
        optional: true
    },
    tablename: {
        type: String,
        optional: true,
        max: 1000
    },
    qid: {
        type: String,
        optional: true,
        max: 1000
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
    }
});

Instances.attachSchema(Schemas.Instance);
Questions.attachSchema(Schemas.Question);
Answers.attachSchema(Schemas.Answer);
Votes.attachSchema(Schemas.Vote);
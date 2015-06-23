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
		regEx: /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/
    },
    email: {
        type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Email
    },
    ip: {
        type: String,
        optional: true,
        max: 1000
    },
	timeorder: {
        type: String,
        optional: true,
        max: 1000
    },
	lasttouch: {
        type: String,
        optional: true,
        max: 1000
    },
	state: {
        type: String,
        optional: true,
        max: 1000
    },
	votes: {
        type: Number,
        max: 1000
    },
});

Schemas.Answer = new SimpleSchema({
    text: {
        type: String,
        label: "Title",
        max: 200
    },
    poster: {
        type: String,
        label: "Author"
    },
    email: {
        type: Number,
        label: "Number of copies",
        min: 0
    },
    ip: {
        type: Date,
        label: "Last date this book was checked out",
        optional: true
    },
    tablename: {
        type: String,
        label: "Brief summary",
        optional: true,
        max: 1000
    },
    qid: {
        type: String,
        label: "Brief summary",
        optional: true,
        max: 1000
    }
});

Schemas.Vote = new SimpleSchema({
    qid: {
        type: String,
        label: "Title",
        max: 200
    },
    ip: {
        type: String,
        label: "Author"
    }
});

Instances.attachSchema(Schemas.Instance);
Questions.attachSchema(Schemas.Question);
Answers.attachSchema(Schemas.Answer);
Votes.attachSchema(Schemas.Vote);
db.createUser(
    {
        user: "admin",
        pwd: "example",
        roles:[
            {
                role: "readWrite",
                db:   "app_db"
            }
        ]
    }
);

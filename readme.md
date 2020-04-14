# file-postgres-session
Express session store using the file system and backing up to a Postgres database

# Usage
```javascript
import * as session from 'express-session';
const filePostgresSession = require('file-postgres-session')(session);

app.use(session({
    store: filePostgresSession({
        connection: pool, // Postgres connection pool
        dir: 'sessions', // dir path to keep session files
        createTable: true, // whether or not to create the table if it doesn not exist
        table: 'sessions', // the name of the table
        backupInterval: 60000, // the interval in which to update the database, in millis
        retryLimit: 100, // number of times to attempt to read a session before failure, negative for infinite
        retryWait: 100 // millis to wait before retrying
    })
}))
```

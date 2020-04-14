const debug = require('debug');

const log = debug('file-postgres-session:log');
log.error = debug('file-postgres-session:error');
log.debug = debug('file-postgres-session:debug');

module.exports = function (session) {
    const FileBackedUpSession = require('file-backedup-session')(session);

    function filePostgresSession(options) {
        options = {
            dir: 'sessions',
            createTable: true,
            table: 'sessions',
            backupInterval: 60000,
            retryLimit: 100,
            retryWait: 100,
            log,
            ...options,
        }
        options.getSessions = () => options.connection.query(`SELECT session_id, data FROM ${options.table};`).then(({ rows }) => rows);
        options.deleteSessions = ids => options.connection.query(
            `DELETE FROM ${options.table} WHERE session_id IN (${
                ids.map((_, i) => `$${i + 1}`).join(',')
            });`,
            ids,
        );
        options.insertOrUpdateSessions = sessions => Promise.all(sessions.map(({id, expires, data}) => options.connection.query(
            `INSERT INTO ${options.table} (session_id, expires, data) VALUES ($1, $2, $3)
             ON CONFLICT(session_id) DO UPDATE SET expires=$2, data=$3;`,
            [
                id,
                expires,
                data,
            ],
        )));
        options.setupBackup = options.createTable && (() => options.connection.query(
            `CREATE TABLE IF NOT EXISTS ${options.table} (
                session_id VARCHAR(128) PRIMARY KEY NOT NULL,
                expires NUMERIC(11, 0) NOT NULL,
                data TEXT
            );`
        ));
        return new FileBackedUpSession(options);
    }

    return filePostgresSession;
};

'use strict';

const Knex = require('knex');

module.exports = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: `./db.sqlite`,
    },
});
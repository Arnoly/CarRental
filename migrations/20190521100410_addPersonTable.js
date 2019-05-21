
exports.up = function(knex, Promise) {
    return knex.schema.createTable('person', table =>
    {
        table.increments('id');
        table.timestamp('firstname');
        table.timestamp('lastname');
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('person');
};

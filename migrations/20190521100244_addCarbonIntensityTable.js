
exports.up = function(knex, Promise) {
    return knex.schema.createTable('carbon_intensity', table =>
    {
        table.increments('id');
        table.timestamp('from');
        table.timestamp('to');
        table.integer('forecast');
        table.integer('actual');
        table.string('index');
    });

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('carbon_intensity');
};

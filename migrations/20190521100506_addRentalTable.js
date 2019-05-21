
exports.up = function(knex, Promise) {

    return knex.schema.createTable( 'rental', table => {
        table.increments('id');
        table.string('from');
        table.string('to');
        table.integer('car_id');
        table.integer('person_id');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('rental');
};

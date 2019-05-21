
exports.up = function(knex, Promise) {

    return knex.schema.createTable( 'rental', table => {
        table.increments('id');
        table.timestamp('from');
        table.timestamp('to');
        table.integer('car_id').references('car.id');
        table.integer('person_id').references('person.id');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('rental');
};

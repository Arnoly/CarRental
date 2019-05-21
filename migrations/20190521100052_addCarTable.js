
exports.up = function(knex, Promise) {
    return knex.schema.createTable( 'car', table => {
        table.increments('id');
        table.string('marque');
        table.string('name');
        table.integer('emission');
        table.integer('isReservee');
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('car');
};


exports.up = function(knex, Promise) {
    return knex.schema.createTable( 'car', table => {
        table.increments('id');
        table.string('marque');
        table.string('name');
        table.integer('emission');
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('car');
};

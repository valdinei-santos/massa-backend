exports.up = function(knex) {
    return knex.schema.createTable('vendedores', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        table.string('nome', 100).notNullable();
        table.string('celular', 15).notNullable();
        table.integer('fl_ativo', 1).notNullable().defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('vendedores');
};
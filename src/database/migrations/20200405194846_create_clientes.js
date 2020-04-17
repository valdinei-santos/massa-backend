
exports.up = function(knex) {
    return knex.schema.createTable('clientes', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        table.string('nome', 100).notNullable();
        table.string('endereco', 250);
        table.string('cidade', 60);
        table.string('celular', 15).notNullable();
        table.integer('fl_ativo', 1).notNullable().defaultTo(1);
        table.integer('usuario_id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('clientes');
};

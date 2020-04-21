exports.up = function(knex) {
    return knex.schema.createTable('lotes', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        
        table.string('dt_lote', 15).notNullable();
        table.integer('status_id', 2).notNullable();
        table.string('observacao');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('lotes');
};
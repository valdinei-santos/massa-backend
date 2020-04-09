exports.up = function(knex) {
    return knex.schema.createTable('lotes_pedidos', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        
        table.integer('lote_id').notNullable();
        table.foreign('lote_id').references('id').inTable('lotes');

        table.integer('pedido_id').notNullable();
        table.foreign('pedido_id').references('id').inTable('pedidos');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('lotes_pedidos');
};

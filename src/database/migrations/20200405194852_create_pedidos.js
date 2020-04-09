
exports.up = function(knex) {
    return knex.schema.createTable('pedidos', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        
        table.string('dataPedido', 15).notNullable();
        //table.string('status', 30).notNullable();
        table.integer('status_id', 2).notNullable();
        table.integer('pago', 1).notNullable().defaultTo(0);
        table.string('observacao');
        
        // table.string('nomeCliente');
        table.string('cliente_id').notNullable();
        table.foreign('cliente_id').references('id').inTable('clientes');

        // table.string('nomeVendedor');
        table.string('vendedor_id').notNullable();
        table.foreign('vendedor_id').references('id').inTable('vendedores');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pedidos');
};

exports.up = function(knex) {
    return knex.schema.createTable('pedidos_itens', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        
        table.integer('qtd').notNullable();
        table.integer('qtdEmbalagem').notNullable();
        table.decimal('precoUnidade').notNullable();
        //table.decimal('valorTotal').notNullable();
        
        table.string('pedido_id').notNullable();
        table.foreign('pedido_id').references('id').inTable('pedidos');

        table.string('produto_id').notNullable();
        table.foreign('produto_id').references('id').inTable('produtos');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pedidos_itens');
};

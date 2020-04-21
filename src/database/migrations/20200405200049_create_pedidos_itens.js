exports.up = function(knex) {
    return knex.schema.createTable('pedidos_itens', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        
        table.integer('qtd').notNullable();
        table.integer('qtd_embalagem').notNullable();
        table.decimal('preco_unidade').notNullable();
        //table.decimal('valorTotal').notNullable();
        
        table.integer('pedido_id').notNullable();
        table.foreign('pedido_id').references('id').inTable('pedidos');

        table.integer('produto_id').notNullable();
        table.foreign('produto_id').references('id').inTable('produtos');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pedidos_itens');
};

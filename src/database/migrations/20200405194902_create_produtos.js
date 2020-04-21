
exports.up = function(knex) {
    return knex.schema.createTable('produtos', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        table.string('nome', 50).notNullable();
        table.string('sabor', 50).notNullable();
        table.string('peso', 30).notNullable();
        table.decimal('preco_unidade').notNullable();
        table.integer('qtd_embalagem').notNullable();
        table.integer('fl_ativo', 1).notNullable().defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('produtos');
};
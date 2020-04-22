
exports.up = function(knex) {
    return knex.schema.createTable('pedidos_status', function (table) {
        table.integer('id', 2).primary();
        table.string('descricao', 40).notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('pedidos_status');
};


exports.up = function(knex) {
    return knex.schema.alterTable('pedidos', function (table) {
        table.foreign('status_id').references('id').inTable('pedidos_status');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('pedidos', function (table) {
        table.dropForeign('status_id');
    });
};

exports.up = function(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments(); // Cria o campo ID autoincremente e já como PK.
        table.string('email', 100).notNullable();
        table.string('password', 100).notNullable();
        table.string('nome', 100);
        table.integer('fl_admin', 1).notNullable().defaultTo(0);
        table.integer('fl_vendedor', 1).notNullable().defaultTo(0);
        table.integer('fl_usuario', 1).notNullable().defaultTo(0);
        table.integer('fl_ativo', 1).notNullable().defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};

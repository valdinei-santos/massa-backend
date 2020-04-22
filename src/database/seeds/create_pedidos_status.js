exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('pedidos_status').del()
    .then(function () {
      // Inserts seed entries
            return knex('pedidos_status').insert([
        {id: 1, descricao: 'Pendente'},
        {id: 2, descricao: 'Alocado'},
        {id: 3, descricao: 'Preparado'},
        {id: 4, descricao: 'Entregue'},
      ]);
    });
};

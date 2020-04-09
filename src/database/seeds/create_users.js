const hash = require('../../utils/generateHash')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      const newPassord = hash('1234');
      return knex('users').insert([
        {id: 1, email: 'valdinei@previg.org.br', password: newPassord, nome: 'Valdinei', 
         fl_admin: 1, fl_vendedor: 0, fl_usuario: 0, fl_ativo: 1
        },
        {id: 2, email: 'joao@joao.com.br', password: newPassord, nome: 'Joao', 
         fl_admin: 0, fl_vendedor: 0, fl_usuario: 1, fl_ativo: 1
        },
      ]);
    });
};

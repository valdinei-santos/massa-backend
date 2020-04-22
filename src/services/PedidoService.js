const db = require('../database/connection');

module.exports = {
    async getCountPedidos(user_id) {
        console.log('PedidoService - getCountPedidos');
        let count
        if (user_id == 0) {
            //console.log('aqio')
            [count] = await db('pedidos').count(); 
        } else {
            //console.log('aqio4343')
            [count] = await db('pedidos').where('user_id', user_id).count(); 
        }
        return count['count'];
    },

    async getAllPedidos(page, status) {
        console.log('PedidoService - getAllPedidos');
        const qtdByPage = 30;
        try {
            const pedidos = await db('pedidos')
                .join('clientes', 'clientes.id', '=', 'pedidos.cliente_id')
                .join('users', 'users.id', '=', 'pedidos.user_id')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select(['pedidos.*', 
                            'clientes.nome as nomeCliente',
                            'users.nome as nomeVendedor'
                ])
                .whereIn('pedidos.status_id', status)
                .orderBy('pedidos.id', 'desc');
            const promises = pedidos.map(async (item, idx) => {
                item.itens = await db('pedidos_itens')
                    .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                    .where('pedidos_itens.pedido_id', item.id)
                    .select(['pedidos_itens.qtd', 
                                'pedidos_itens.qtd_embalagem', 
                                'pedidos_itens.preco_unidade',
                                'pedidos_itens.produto_id', 
                                'produtos.nome',
                                'produtos.sabor',
                                'produtos.peso',
                    ])
                    .orderBy('pedidos_itens.produto_id', 'asc');
                });
            await Promise.all(promises);
            return pedidos;
        } catch (e) {
            console.log('Erro PedidoService - getAllPedidos: ' + e);
            //return response.status(500).json({'error': 'Error in SQL'});
            return;
        }
    },

    async getUserPedidos(page, status, user_id) {
        console.log('PedidoService - getUserPedidos');
        const qtdByPage = 30;
        const pedidos = await db('pedidos')
            .join('clientes', 'clientes.id', '=', 'pedidos.cliente_id')
            .join('users', 'users.id', '=', 'pedidos.user_id')
            .limit(qtdByPage)
            .offset((page - 1) * qtdByPage)
            .select(['pedidos.*', 
                        'clientes.nome as nomeCliente',
                        'users.nome as nomeVendedor'
            ])
            .whereIn('pedidos.status_id', status)
            .where('pedidos.user_id', user_id)
            .orderBy('pedidos.id', 'desc');
        const promises = pedidos.map(async (item, idx) => {
            item.itens = await db('pedidos_itens')
                .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                .where('pedidos_itens.pedido_id', item.id)
                .select(['pedidos_itens.qtd', 
                            'pedidos_itens.qtd_embalagem', 
                            'pedidos_itens.preco_unidade',
                            'pedidos_itens.produto_id', 
                            'produtos.nome',
                            'produtos.sabor',
                            'produtos.peso',
                ])
                .orderBy('pedidos_itens.produto_id', 'asc');
            });
        await Promise.all(promises);
        return pedidos;
    },

}

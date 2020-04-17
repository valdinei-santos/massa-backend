const db = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 30;
            const { page = 1 } = request.query;
            const [count] = await db('pedidos').count();
            const pedidos = await db('pedidos')
                .join('clientes', 'clientes.id', '=', 'pedidos.cliente_id')
                .join('vendedores', 'vendedores.id', '=', 'pedidos.vendedor_id')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select(['pedidos.*', 
                         'clientes.nome as nomeCliente',
                         'vendedores.nome as nomeVendedor'
                ])
                .orderBy('dataPedido', 'desc');
            const promises = pedidos.map(async (item, idx) => {
                item.itens = await db('pedidos_itens')
                    .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                    .where({pedido_id: item.id})
                    .select(['pedidos_itens.qtd', 
                             'pedidos_itens.qtdEmbalagem', 
                             'pedidos_itens.precoUnidade',
                             'pedidos_itens.produto_id', 
                             'produtos.nome',
                             'produtos.sabor',
                             'produtos.peso',
                    ])
                    .orderBy('produto_id', 'asc');
                });
            await Promise.all(promises);
            response.header('X-Total-Count', count['count(*)']);
            if (pedidos) {
                return response.status(200).json(pedidos);
            } 
            return response.status(400).json({'error': 'Clientes not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { dataPedido, status_id, pago, observacao, cliente_id, vendedor_id, itens } = request.body;
            let idInsert;
            const trx = await db.transaction();
            trx('pedidos')
                .insert({dataPedido, status_id, pago, observacao, cliente_id, vendedor_id})
                .then((id) => {
                    idInsert = id[0];
                    // Insert na tabela filho
                    itens.forEach((item) => item.pedido_id = id[0]);
                    return trx('pedidos_itens').insert(itens);
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ id: idInsert });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Pedido not created'});
                });
        } catch (err) {
            console.log('Erro: ' + err);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { dataPedido, status_id, pago, observacao, cliente_id, vendedor_id, itens } = request.body;
            const trx = await db.transaction();
            trx('pedidos')
                .where({id: id})
                .update({dataPedido, status_id, pago, observacao, cliente_id, vendedor_id})
                .then(() => {
                    return trx('pedidos_itens').where({pedido_id: id}).delete();
                })
                .then(() => {
                    // Insert na tabela filho
                    itens.forEach((item) => item.pedido_id = id);
                    return trx('pedidos_itens').insert(itens);
                })
                .then(() => {
                    trx.commit();
                    return response.status(200).json({ id });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Pedido not updated'});
                });
            /* const { id } = request.params;
            const { dataPedido, status_id, pago, observacao, cliente_id, vendedor_id } = request.body;
            let result = null;
            result = await db('peiddos')
                .where({id: id})
                .update({ dataPedido, status_id, pago, observacao, cliente_id, vendedor_id });
            if (result) {
                return response.status(200).json({'data': 'Pedido updated'});
            } 
            return response.status(404).json({'error': 'Pedido not found'}); */
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async delete(request, response) {
        try {
            const { id } = request.params;
            let result = null;
            result = await db('pedidos').where({id: id}).delete();
            if (result) {
                return response.status(200).json({ id });
            } 
            return response.status(404).send('Pedido not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async productsPerPedido(request, response) {
        console.log('PedidoController - productsPerPedido');
        try {
            const { id } = request.params;
            const produtos = await db('pedidos_itens')
                        .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                        .where('pedidos_itens.pedido_id', id)
                        .select(['pedidos_itens.qtd',
                                'produtos.qtdEmbalagem', 
                                'produtos.precoUnidade', 
                                db.raw('(pedidos_itens.qtd * (pedidos_itens.qtdEmbalagem * pedidos_itens.precoUnidade) ) as precoEmbalagem' ),
                                'produtos.id',
                                'produtos.nome',
                                'produtos.sabor',
                                'produtos.peso'])
                        .orderBy('produtos.nome', 'asc');
            if (produtos) {
                return response.status(200).json(produtos);
            } 
            return response.status(400).json({'error': 'Pedido not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async productsPerListaPedido(request, response) {
        console.log('PedidoController - productsPerPedido');
        try {
            // const { listaPedidos } = request.body;
            const { listaPedidos = [1] } = request.query;
            //let listaPedidosNew = listaPedidos.split(',');

            const produtos = await db('pedidos_itens')
                        .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                        .whereIn('pedidos_itens.pedido_id', listaPedidos)
                        .select([db.raw('sum(pedidos_itens.qtd) as qtd'),
                                 db.raw('sum(pedidos_itens.qtd * (pedidos_itens.qtdEmbalagem * pedidos_itens.precoUnidade) ) as total' ),
                                'produtos.id',
                                'produtos.nome',
                                'produtos.sabor',
                                'produtos.peso',
                                'produtos.qtdEmbalagem',
                                'produtos.precoUnidade'])
                        .groupByRaw('produtos.id')
                        .orderBy('produtos.nome', 'asc');
            if (produtos) {
                return response.status(200).json(produtos);
            } 
            return response.status(400).json({'error': 'Pedidos not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

}

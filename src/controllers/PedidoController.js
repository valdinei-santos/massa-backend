const db = require('../database/connection');
const pedidoService = require('../services/PedidoService');

module.exports = {
    async index(request, response) {
        try {
            const { page = 1, status = 0, user_id = 0 } = request.query;
            let newStatus;
            if (status === 0) {
                newStatus = [1,2,3];
            } else {
                newStatus = [status];
            }
            const count = await pedidoService.getCountPedidos(user_id);
            let pedidos;
            if (user_id == 0) {
                //pedidos = await pedidoService.getAllPedidos(page, newStatus);
                pedidos = await pedidoService.getAllPedidos(page, newStatus)
            } else {
                pedidos = await pedidoService.getUserPedidos(page, newStatus, user_id);
            }
            //console.log('PED5: ', pedidos);
            

            /* const qtdByPage = 30;
            const { page = 1, status = 0, user_id = 0 } = request.query;
            const [count] = await db('pedidos').count();
            let newStatus;
            if (status === 0) {
                newStatus = [1,2,3];
            } else {
                newStatus = [status];
            }
            const pedidos = await db('pedidos')
                .join('clientes', 'clientes.id', '=', 'pedidos.cliente_id')
                .join('users', 'users.id', '=', 'pedidos.user_id')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select(['pedidos.*', 
                         'clientes.nome as nomeCliente',
                         'users.nome as nomeVendedor'
                ])
                .whereIn('status_id', newStatus)
                .orderBy('id', 'desc');
            const promises = pedidos.map(async (item, idx) => {
                item.itens = await db('pedidos_itens')
                    .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                    .where({pedido_id: item.id})
                    .select(['pedidos_itens.qtd', 
                             'pedidos_itens.qtd_embalagem', 
                             'pedidos_itens.preco_unidade',
                             'pedidos_itens.produto_id', 
                             'produtos.nome',
                             'produtos.sabor',
                             'produtos.peso',
                    ])
                    .orderBy('produto_id', 'asc');
                });
            await Promise.all(promises); */
         
            
            response.header('X-Total-Count', count);
            if (pedidos) {
                return response.status(200).json(pedidos);
            } 
            return response.status(400).json({'error': 'Pedidos not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { dt_pedido, status_id, pago, observacao, cliente_id, user_id, itens } = request.body;
            let idInsert;
            const trx = await db.transaction();
            trx('pedidos')
                .returning('id')
                .insert({dt_pedido, status_id, pago, observacao, cliente_id, user_id})
                .then((id) => {
                    idInsert = Number(id);
                    // Insert na tabela filho
                    itens.forEach((item) => {
                        item.pedido_id = idInsert;
                        item.preco_unidade = Number(item.preco_unidade)
                        delete item.nome;
                        delete item.sabor;
                        delete item.peso;
                    });
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
            const { dt_pedido, status_id, pago, observacao, cliente_id, user_id, itens } = request.body;
            const trx = await db.transaction();
            trx('pedidos')
                .where({id: id})
                .update({dt_pedido, status_id, pago, observacao, cliente_id, user_id})
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
            const { dt_pedido, status_id, pago, observacao, cliente_id, vendedor_id } = request.body;
            let result = null;
            result = await db('peiddos')
                .where({id: id})
                .update({ dt_pedido, status_id, pago, observacao, cliente_id, vendedor_id });
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
                                'produtos.qtd_embalagem', 
                                'produtos.preco_unidade', 
                                db.raw('(pedidos_itens.qtd * (pedidos_itens.qtd_embalagem * pedidos_itens.preco_unidade) ) as precoEmbalagem' ),
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
                                 db.raw('sum(pedidos_itens.qtd * (pedidos_itens.qtd_embalagem * pedidos_itens.preco_unidade) ) as total' ),
                                'produtos.id',
                                'produtos.nome',
                                'produtos.sabor',
                                'produtos.peso',
                                'produtos.qtd_embalagem',
                                'produtos.preco_unidade'])
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

const db = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 30;
            const { page = 1 } = request.query;
            const [count] = await db('lotes').count();
            const lotes = await db('lotes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('id', 'desc');

            const promise = lotes.map(async (item, idx) => {
                let umPedido;
                //item.pedidos = 
                umPedido = await db('lotes_pedidos')
                    .join('pedidos', 'pedidos.id', '=', 'lotes_pedidos.pedido_id')
                    .join('clientes', 'clientes.id', '=', 'pedidos.cliente_id')
                    .join('users', 'users.id', '=', 'pedidos.user_id')
                    .where({'lotes_pedidos.lote_id': item.id})
                    .select(['pedidos.id as pedido_id',
                             'clientes.nome as nomeCliente',
                             'users.nome as nomeVendedor',
                    ])
                    .orderBy('pedido_id', 'asc');
                //console.log('UmPedido', umPedido);
                const promise2 = umPedido.map(async (pedido, idx) => {
                    pedido.produtos = await db('pedidos_itens')
                        .join('produtos', 'produtos.id', '=', 'pedidos_itens.produto_id')
                        .where({'pedidos_itens.pedido_id': pedido.pedido_id})
                        .select(['pedidos_itens.qtd',
                                'pedidos_itens.qtdEmbalagem',
                                'pedidos_itens.precoUnidade',
                                'produtos.id',
                                'produtos.nome',
                                'produtos.sabor',
                                'produtos.peso',
                        ])
                        .orderBy('produtos.nome', 'asc');
                });
                await Promise.all(promise2);
                item.pedidos = umPedido;
            });
            
            await Promise.all(promise);

            response.header('X-Total-Count', count['count(*)']);
            if (lotes) {
                return response.status(200).json(lotes);
            } 
            return response.status(400).json({'error': 'Lotes not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { dataLote, status_id, observacao, pedidos } = request.body;
            let idInsert;
            const trx = await db.transaction();
            trx('lotes')
                .insert({dataLote, status_id, observacao})
                .then((id) => {
                    idInsert = id[0];
                    // Insert na tabela filho
                    pedidos.forEach((item) => item.lote_id = id[0]);
                    const promise1 = trx('lotes_pedidos').insert(pedidos);
                    const promise2 = pedidos.map(async (item) => {
                        await trx('pedidos')
                        .where({id: item.pedido_id})
                        .update({status_id: 2});
                    });
                    Promise.all([promise1, promise2])
                        .then(() => {
                            trx.commit();
                            return response.status(201).json({ id: idInsert });
                        });
                })
                /* .then(() => {
                    trx.commit();
                    return response.status(201).json({ id: idInsert });
                }) */
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Lote not created'});
                });

            //console.log(request.body);
            /* const trx = await db.transaction();
            trx('lotes')
                .insert({dataLote, status_id, observacao})
                .then((id) => {
                    idInsert = id[0];
                    // Insert na tabela filho
                    pedidos.forEach((item) => item.lote_id = id[0]);
                    return trx('lotes_pedidos').insert(pedidos);
                })
                .then(() => {
                    pedidos.map( async (item) => {
                        await trx('pedidos')
                        .where({id: item.pedido_id})
                        .update({status_id: 2});
                    })
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ id: idInsert });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Lote not created'});
                }); */
        } catch (err) {
            console.log('Erro: ' + err);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { dataLote, status_id, observacao, pedidos } = request.body;
            const trx = await db.transaction();
            trx('lotes')
                .where({id: id})
                .update({dataLote, status_id, observacao})
                .then(() => {
                    return trx('lotes_pedidos').where({lote_id: id}).delete();
                })
                .then(() => {
                    // Insert na tabela filho
                    pedidos.forEach((item) => item.lote_id = id);
                    return trx('lotes_pedidos').insert(pedidos);
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ id });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Lote not created'});
                });
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async delete(request, response) {
        try {
            const { id } = request.params;
            const trx = await db.transaction();
            trx('lotes_pedidos')
                .where({lote_id: id})
                .delete()
                .then(() => {
                    return trx('lotes').where({id: id}).delete();
                })
                .then(() => {
                    trx.commit();
                    return response.status(200).json({ id });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Lote not deleted'});
                });
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

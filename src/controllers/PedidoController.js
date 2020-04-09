const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('pedidos').count();
            const pedidos = await connection('pedidos')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('dataPedido', 'desc');
            const promises = pedidos.map(async (item, idx) => {
                item.itens = await connection('pedidos_itens')
                    .where({pedido_id: item.id})
                    .select(['produto_id', 'qtd', 'qtdEmbalagem', 'precoUnidade'])
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
            const trx = await connection.transaction();
            trx('pedidos')
                .insert({dataPedido, status_id, pago, observacao, cliente_id, vendedor_id})
                .then((id) => {
                    // Insert na tabela filho
                    itens.forEach((item) => item.pedido_id = id[0]);
                    return trx('pedidos_itens').insert(itens);
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ 'data': 'Pedido created' });
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
            const trx = await connection.transaction();
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
                    return response.status(201).json({ 'data': 'Pedido updated' });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Pedido not created'});
                });
            /* const { id } = request.params;
            const { dataPedido, status_id, pago, observacao, cliente_id, vendedor_id } = request.body;
            let result = null;
            result = await connection('peiddos')
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
            result = await connection('pedidos').where({id: id}).delete();
            if (result) {
                return response.status(200).json({'data': 'Pedido deleted'});
            } 
            return response.status(404).send('Pedido not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

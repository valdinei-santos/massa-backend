const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('lotes').count();
            const lotes = await connection('lotes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('dataLote', 'desc');

            const promises = lotes.map(async (item, idx) => {
                item.pedidos = await connection('lotes_pedidos')
                    .where({lote_id: item.id})
                    .select('pedido_id')
                    .orderBy('pedido_id', 'asc');
            });
            await Promise.all(promises);
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
            //console.log(request.body);
            const trx = await connection.transaction();
            trx('lotes')
                .insert({dataLote, status_id, observacao})
                .then((id) => {
                    // Insert na tabela filho
                    pedidos.forEach((item) => item.lote_id = id[0]);
                    return trx('lotes_pedidos').insert(pedidos);
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ 'data': 'Lote created' });
                })
                .catch(() => {
                    trx.rollback();
                    return response.status(400).json({'error': 'Lote not created'});
                });
        } catch (err) {
            console.log('Erro: ' + err);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { dataLote, status_id, observacao, pedidos } = request.body;
            const trx = await connection.transaction();
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
                    return response.status(201).json({ 'data': 'Lote updated' });
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
            const trx = await connection.transaction();
            trx('lotes_pedidos')
                .where({lote_id: id})
                .delete()
                .then(() => {
                    return trx('lotes').where({id: id}).delete();
                })
                .then(() => {
                    trx.commit();
                    return response.status(201).json({ 'data': 'Lote deleted' });
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

const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('clientes').count();
            const clientes = await connection('clientes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc');
            response.header('X-Total-Count', count['count']);
            if (clientes) {
                return response.status(200).json(clientes);
            } 
            return response.status(400).json({'error': 'Clientes not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { nomeCliente: nome, endereco, cidade, celular } = request.body;
            // Sqlite
            //const [id] = await connection('clientes').insert({nome, endereco, cidade, celular,});
            // Postgres
            const id = await connection('clientes')
                .returning('id')
                .insert({nome, endereco, cidade, celular,});
            if (id) {
                return response.status(201).json({ id });
            } 
            return response.status(400).json({'error': 'Cliente not created'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { nomeCliente: nome, endereco, cidade, celular } = request.body;
            let result = null;
            result = await connection('clientes')
                .where({id: id})
                .update({ nome, endereco, cidade, celular, });
            if (result) {
                return response.status(200).json({'data': 'Cliente updated'});
            } 
            return response.status(404).json({'error': 'Cliente not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async delete(request, response) {
        try {
            const { id } = request.params;
            let result = null;
            result = await connection('clientes').where({id: id}).delete();
            if (result) {
                return response.status(200).json({'data': 'Cliente deleted'});
            } 
            return response.status(404).send('Cliente not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

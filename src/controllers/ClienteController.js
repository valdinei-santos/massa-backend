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
            response.header('X-Total-Count', count['count(*)']);
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
        //const ong_id = request.headers.authorization;
        //console.log(request.body);
        //console.log(nome, endereco, cidade, celular);
        try {
            const { nome, endereco, cidade, celular } = request.body;
            const [id] = await connection('clientes').insert({nome, endereco, cidade, celular,});
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
            const { nome, endereco, cidade, celular } = request.body;
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
        /* const ong_id = request.headers.authorization;
        const incident = await connection('clientes')
            .where('id', id)
            .select('ong_id')
            .first();
        if (incident.ong_id !== ong_id) {
            return response.status(401).json({ error: "Operation not permitted." });
        } */
    }

}

const db = require('../database/connection');
const clienteService = require('../services/ClienteService');

module.exports = {
    async index(request, response) {
        try {
            const { page = 1, user_id = 0 } = request.query;
            const count = await clienteService.getCountClientes(user_id);
            let clientes;
            if (user_id == 0) {
                //pedidos = await clienteService.getAllPedidos(page, newStatus);
                clientes = await clienteService.getAllClientes(page)
            } else {
                clientes = await clienteService.getUserClientes(page, user_id);
            }

            /* const qtdByPage = 30;
            const { page = 1 } = request.query;
            const [count] = await db('clientes').count();
            const clientes = await db('clientes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc'); */

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
        console.log('ClienteController - create');
        //const ong_id = request.headers.authorization;
        //console.log(request.body);
        //console.log(nome, endereco, cidade, celular);
        try {
            const { nome, endereco, cidade, celular, fl_ativo, user_id } = request.body;
            //console.log('ClienteController - create 2', request.body);
            const id = await db('clientes')
                .returning('id')
                .insert({nome, endereco, cidade, celular, fl_ativo, user_id});
            console.log('ClienteController - create 3', id);
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
            const { nome, endereco, cidade, celular, user_id } = request.body;
            let result = null;
            result = await db('clientes')
                .where({id: id})
                .update({ nome, endereco, cidade, celular, user_id});
            if (result) {
                return response.status(200).json({ id });
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
            result = await db('clientes').where({id: id}).delete();
            if (result) {
                return response.status(200).json({ id });
            } 
            return response.status(404).send('Cliente not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
        /* const ong_id = request.headers.authorization;
        const incident = await db('clientes')
            .where('id', id)
            .select('ong_id')
            .first();
        if (incident.ong_id !== ong_id) {
            return response.status(401).json({ error: "Operation not permitted." });
        } */
    }

}

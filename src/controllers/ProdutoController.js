const db = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 30;
            const { page = 0 } = request.query;
            const [count] = await db('produtos').count();
            let produtos;
            if (page === 0) {
                produtos = await db('produtos').select('*').orderByRaw('nome ,sabor');
            } else {
                produtos = await db('produtos')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                //.orderBy('nome', 'asc')
                .orderByRaw('nome ,sabor');
            }
            response.header('X-Total-Count', count['count(*)']);
            if (produtos) {
                return response.status(200).json(produtos);
            } 
            return response.status(400).json({'error': 'Produtos not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { nome, sabor, peso, precoUnidade, qtdEmbalagem } = request.body;
            const [id] = await db('produtos')
                .insert({nome, sabor, peso, precoUnidade, qtdEmbalagem});
            if (id) {
                return response.status(201).json({ id });
            } 
            return response.status(400).json({'error': 'Produto not created'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { nome, sabor, peso, precoUnidade, qtdEmbalagem } = request.body;
            let result = null;
            result = await db('produtos')
                .where({id: id})
                .update({ nome, sabor, peso, precoUnidade, qtdEmbalagem });
            if (result) {
                return response.status(200).json({ id });
            } 
            return response.status(404).json({'error': 'Produto not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async delete(request, response) {
        try {
            const { id } = request.params;
            let result = null;
            result = await db('produtos').where({id: id}).delete();
            if (result) {
                return response.status(200).json({ id });
            } 
            return response.status(404).send('Produto not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

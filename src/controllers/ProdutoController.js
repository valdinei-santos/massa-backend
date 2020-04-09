const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('produtos').count();
            const produtos = await connection('produtos')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc');
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
            const [id] = await connection('produtos')
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
            result = await connection('produtos')
                .where({id: id})
                .update({ nome, sabor, peso, precoUnidade, qtdEmbalagem });
            if (result) {
                return response.status(200).json({'data': 'Produto updated'});
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
            result = await connection('produtos').where({id: id}).delete();
            if (result) {
                return response.status(200).json({'data': 'Produto deleted'});
            } 
            return response.status(404).send('Produto not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

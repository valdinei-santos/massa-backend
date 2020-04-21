const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('vendedores').count();
            const vendedores = await connection('vendedores')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc');
            response.header('X-Total-Count', count['count']);
            if (vendedores) {
                return response.status(200).json(vendedores);
            } 
            return response.status(400).json({'error': 'Vendedores not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        try {
            const { nome, celular } = request.body;
            const id = await connection('vendedores')
                .returning('id')
                .insert({nome, celular,});
            if (id) {
                return response.status(201).json({ id });
            } 
            return response.status(400).json({'error': 'Vendedor not created'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async update(request, response) {
        try {
            const { id } = request.params;
            const { nome, celular } = request.body;
            let result = null;
            result = await connection('vendedores')
                .where({id: id})
                .update({ nome, celular });
            if (result) {
                return response.status(200).json({'data': 'Vendedor updated'});
            } 
            return response.status(404).json({'error': 'Vendedor not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async delete(request, response) {
        try {
            const { id } = request.params;
            let result = null;
            result = await connection('vendedores').where({id: id}).delete();
            if (result) {
                return response.status(200).json({'data': 'Vendedor deleted'});
            } 
            return response.status(404).send('Vendedor not found');
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    }

}

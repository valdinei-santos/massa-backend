const db = require('../database/connection');

module.exports = {
    async getCountClientes(user_id) {
        console.log('ClienteService - getCountClientes');
        let count
        if (user_id == 0) {
            [count] = await db('clientes').count(); 
        } else {
            [count] = await db('clientes').where('user_id', user_id).count(); 
        }
        return count['count'];
    },

    async getAllClientes(page, status) {
        console.log('ClienteService - getAllClientes');
        const qtdByPage = 30;
        try {
            const clientes = await db('clientes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc');
            return clientes;
        } catch (e) {
            console.log('Erro ClienteService - getAllClientes: ' + e);
            //return response.status(500).json({'error': 'Error in SQL'});
            return;
        }
    },

    async getUserClientes(page, user_id) {
        console.log('ClienteService - getUserClientes');
        const qtdByPage = 30;
        try {
            const clientes = await db('clientes')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .where('user_id', user_id)
                .orderBy('nome', 'asc');
            return clientes;
        } catch (e) {
            console.log('Erro ClienteService - getAllClientes: ' + e);
            //return response.status(500).json({'error': 'Error in SQL'});
            return;
        }
    },

}

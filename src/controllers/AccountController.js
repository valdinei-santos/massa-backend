const connection = require('../database/connection');
const bcrypt = require('bcryptjs');
//const jwt = require('jwt-simple');
const jwt = require('jsonwebtoken');
//const { JWT_SECRET } = require('../../.env');
const JWT_SECRET = '#$223&*$$2a3eo32dg2kt47';

module.exports = {
    async index(request, response) {
        try {
            const qtdByPage = 10;
            const { page = 1 } = request.query;
            const [count] = await connection('users').count();
            const users = await connection('users')
                .limit(qtdByPage)
                .offset((page - 1) * qtdByPage)
                .select('*')
                .orderBy('nome', 'asc');
            response.header('X-Total-Count', count['count']);
            if (users) {
                return response.status(200).json(users);
            } 
            return response.status(400).json({'error': 'Users not found'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async create(request, response) {
        //const token = request.headers.authorization;
        try {
            const { email, password, nome, fl_admin, fl_vendedor, fl_usuario, fl_ativo } = request.body;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            
            const id = await connection('users')
                .returning('id')
                .insert({email, password: hash, nome, fl_admin, fl_vendedor, fl_usuario, fl_ativo});
            if (id) {
                return response.status(201).json({ id });
            } 
            return response.status(400).json({'error': 'User not created'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    async login(request, response) {
        try {
            const { email, password } = request.body;
            if(!email || !password){
                return response.status(400).send('Dados incompletos');
            }
            const user = await connection('users')
                .where({ email, fl_ativo: 1 })
                .first();
                console.log('passou 2')
            if (user) {
                result = bcrypt.compareSync(password, user.password); // Irá retornar true.
                if (result) {
                    const token = jwt.sign(
                        { userId: user.id, username: user.email },
                        JWT_SECRET,
                        { expiresIn: "1h" }
                    );
                    return response.status(200).json({
                        id: user.id,
                        admin: user.fl_admin,
                        name: user.nome,
                        email: user.email,
                        token: token
                    });
                }
            }
            return response.status(400).json({'error': 'Fail in login'});
        } catch (e) {
            console.log('Erro: ' + e);
            return response.status(500).json({'error': 'Error in SQL'});
        }
    },

    /* async update(request, response) {
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
    }, */

    /* async delete(request, response) {
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
    } */

}

const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const checkJwt = require('./middlewares/checkJwt');
const AccountController = require('./controllers/AccountController');
const ClienteController = require('./controllers/ClienteController');
const ProdutoController = require('./controllers/ProdutoController');
const VendedorController = require('./controllers/VendedorController');
const PedidoController = require('./controllers/PedidoController');
const LoteController = require('./controllers/LoteController');

const routes = express.Router();

routes.post('/login', AccountController.login);
routes.post('/user/register', [checkJwt], AccountController.create);
routes.get('/users', [checkJwt], AccountController.index);
routes.put('/users/:id([0-9]+)', [checkJwt], AccountController.update);
routes.put('/users/password/:id([0-9]+)', [checkJwt], AccountController.update_password);
routes.delete('/users/:id([0-9]+)', [checkJwt], AccountController.delete);

routes.get('/clientes', [checkJwt], ClienteController.index);
//routes.get('/clientes', [], ClienteController.index);
routes.post('/clientes', [checkJwt], ClienteController.create);
routes.put('/clientes/:id([0-9]+)', [checkJwt], ClienteController.update);
routes.delete('/clientes/:id([0-9]+)', [checkJwt], ClienteController.delete);

routes.get('/produtos', [checkJwt], ProdutoController.index);
routes.post('/produtos', [checkJwt], ProdutoController.create);
routes.put('/produtos/:id([0-9]+)', [checkJwt], ProdutoController.update);
routes.delete('/produtos/:id([0-9]+)', [checkJwt], ProdutoController.delete);

routes.get('/vendedores', [checkJwt], VendedorController.index);
routes.post('/vendedores', [checkJwt], VendedorController.create);
routes.put('/vendedores/:id([0-9]+)', [checkJwt], VendedorController.update);
routes.delete('/vendedores/:id([0-9]+)', [checkJwt], VendedorController.delete);

routes.get('/pedidos', [checkJwt], PedidoController.index);
routes.post('/pedidos', [checkJwt], PedidoController.create);
routes.put('/pedidos/:id([0-9]+)', [checkJwt], PedidoController.update);
routes.delete('/pedidos/:id([0-9]+)', [checkJwt], PedidoController.delete);
routes.get('/pedidos/:id([0-9]+)/produtos', [checkJwt], PedidoController.productsPerPedido);
routes.get('/pedidos/lista/produtos', [checkJwt], PedidoController.productsPerListaPedido);
routes.put('/pedidos/:id([0-9]+)/status', [checkJwt], PedidoController.alterStatus);

routes.get('/lotes', [checkJwt], LoteController.index);
routes.post('/lotes', [checkJwt], LoteController.create);
routes.put('/lotes/:id([0-9]+)', [checkJwt], LoteController.update);
routes.delete('/lotes/:id([0-9]+)', [checkJwt], LoteController.delete);


/*
routes.get('/ongs', OngController.index);
routes.post('/ongs', celebrate({
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.string().required().min(10).max(11),
        city: Joi.string().required(),
        uf: Joi.string().required().length(2)
    })
}), OngController.create);

routes.get('/profile', celebrate({
    [Segments.HEADERS]: Joi.object({
        authorization: Joi.string().required(),
    }).unknown(),
}), ProfileController.index)

routes.get('/incidents', celebrate({
    [Segments.QUERY]: Joi.object().keys({
        page: Joi.number(),
    })
}), IncidentController.index);
routes.post('/incidents', IncidentController.create);
routes.delete('/incidents/:id', celebrate({
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.number().required(),
    })
}), IncidentController.delete);
*/

/**
 * Tipos de Parametros:
 * 
 * Query Params: Parametros nomeados enviados na rota após ? (Filtros, paginação)
 * Route Params: Parametros utilizados para identificar recursos 
 * Request Body: Corpo da requisição, utilizado para criar e alterar recursos (POST, PUT, PATCH)
 * 
 */

// EXEMPLOS
/* routes.get('/users', (request, response) => {
    const paramsQuery = request.query;  // Para pegar parametros repassados após o ?
    const params = request.params;      // Para pegar parametros do recurso
    console.log(paramsQuery); 
    console.log(params); 

    return response.json({ 
        evento: 'Semana OmniStack',
        aluno: 'Valdinei' 
    });
}); 

routes.post('/users', (request, response) => {
    const body = request.body;          // Para pegar o corpo da requisão (JSON)
    console.log(body); 

    return response.json({ 
        evento: 'Semana OmniStack',
        aluno: 'Valdinei' 
    });
});
*/ 

module.exports = routes;

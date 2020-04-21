//const { Request, Response, NextFunction } = require('express');
const jwt = require('jsonwebtoken');
//const logger = require('../config/winston');
//const { JWT_SECRET } = require('../../.env');
const JWT_SECRET = '#$223&*$$2a3eo32dg2kt47';

module.exports = function checkJwt(req, res, next) {
    //Get the jwt token from the head
    const token = req.headers["authorization"];
    let jwtPayload;

    //Try to validate the token and get data
    try {
        // jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        jwtPayload = jwt.verify(token, JWT_SECRET);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        res.status(401).send();
        return;
    }

    //The token is valid for 1 hour
    //We want to send a new token on every request
    const { userId, username } = jwtPayload;
    // logger.info('checkJwt-dados: ' + userId, username);
    const newToken = jwt.sign({ userId, username }, JWT_SECRET, {
        expiresIn: "1h"
    });
    res.setHeader("token", newToken);

    //Call the next middleware or controller
    next();
};
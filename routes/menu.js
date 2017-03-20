var router = require('express').Router();
var menuPersistent = require('../models/menu.js');
var messaging = require('../uses').messaging;
var uuid = require('node-uuid');
module.exports = menuAPI;

function menuAPI(app) {
    var dbconnection = app.get('dbpool');
    	
    router.get('/', function(req, res) {
        menuPersistent.getAll(dbconnection, messaging.bind(res));
    })

    return router
}
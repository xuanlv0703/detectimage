var router = require('express').Router();
var personPersistent = require('../models/person.js');
var messaging = require('../uses').messaging;


module.exports = personAPI;

function personAPI(app) {
    var dbconnection = app.get('dbpool');
    router.get('/:uid', function(req, res) {
        var uid = req.params.uid;
        personPersistent.getall(uid,dbconnection, messaging.bind(res));
    });

    return router
}

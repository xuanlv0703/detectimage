var router = require('express').Router();
var subscriptionsPersistent = require('../models/subscriptions.js');
var messaging = require('../uses').messaging;


module.exports = subscriptionsAPI;

function subscriptionsAPI(app) {
    var dbconnection = app.get('dbpool');
    router.get('/', function(req, res) {
        subscriptionsPersistent.getall(dbconnection, messaging.bind(res));
    });

     router.post('/',function(req,res){
    	var objSub = req.body;
    	subscriptionsPersistent.create(objSub,dbconnection,messaging.bind(res));
    })

      router.put('/',function(req,res){
    	var objSub = req.body;
    	subscriptionsPersistent.edit(objSub,dbconnection,messaging.bind(res));
    })



    return router
}

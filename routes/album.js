var router = require('express').Router();
var albumPersistent = require('../models/album.js');
var messaging = require('../uses').messaging;


module.exports = albumAPI;

function albumAPI(app) {
    var dbconnection = app.get('dbpool');
    router.get('/:uid', function(req, res) {
        var uid = req.params.uid;
        albumPersistent.getall(uid,dbconnection, messaging.bind(res));
    });

    router.post('/:uid',function(req,res){
    	var uid = req.params.uid;
    	var objAlbum = req.body;
    	objAlbum.uid = uid;
    	albumPersistent.create(objAlbum,dbconnection,messaging.bind(res));
    })

    return router
}

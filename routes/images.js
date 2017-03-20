var router = require('express').Router();
var imagesPersistent = require('../models/images.js');
var messaging = require('../uses').messaging;
var facedetect = require('./facedetect.js');
var personPersistent = require('../models/person.js');
var async = require('async'), fs = require('fs')
var md5 = require('md5');
module.exports = imagesAPI;

function imagesAPI(app) {
    var dbconnection = app.get('dbpool');
    router.get('/:uid', function(req, res) {
        var uid = req.params.uid;
        imagesPersistent.getall(uid, dbconnection, messaging.bind(res));
    });

    router.post('/:imgid', function(req, res) {
        var imgid = req.params.id;
        var imgObj = req.body;
        async.waterfall([async.constant(imgObj), getPersonid, getPersonObj, trainAlbum,updateImageObj], function(err,imgObj){
            if(!err){
            res.jsonp({error:false,message:'Success',data:imgObj});
            }else{
            res.jsonp({error:true,message:'Something is wrong!',data:imgObj});
            }
        })

    });

    function getPersonid(imgObj, callback) {
        var uid = imgObj.uid;
        var personid = imgObj.persontags.map(function(name) {
            var pname = name.trim();
            var pid = md5(uid + pname);
            personPersistent.getperson(pid, dbconnection, function(data) {
                if (data == null) {
                    personPersistent.newperson(pid, pname, 0, uid, dbconnection, function(data) {});
                }
            })
            return pid;
        })
        imgObj.personid = personid
        callback(null, imgObj);
    }

    function getPersonObj(imgObj, callback) {
        if (imgObj.personobj == null) {
            facedetect.detect(imgObj.path, function(stt, body) {
                if (stt == 200) {
                    imgObj.personobj = body.photos[0];
                }
                callback(null, imgObj);
            });
        } else {
            callback(null, imgObj);
        }

    }

    function trainAlbum(imgObj, callback) {

        if (imgObj.personobj != null && imgObj.istemplate == 0) {
            if (imgObj.personobj.tags.length == 1 && imgObj.personid.length == 1) {
                var albumname = imgObj.albumname;
                var albumkey = imgObj.albumkey;
                var entryid = imgObj.personid[0];
                var filename = imgObj.path;
                facedetect.trainAlbum(albumname, albumkey, entryid, filename, function(stt, body) {
                    if (stt == 200) {
                        var tnum = body.image_count;
                        imgObj.istemplate = 1;
                        personPersistent.updatetnum(entryid, tnum,dbconnection, function(err) {});

                        facedetect.rebuildAlbum(albumname, albumkey, function(stt, body) {});
                        callback(null, imgObj);
                    } else {
                        callback(null, imgObj)
                    }
                })
            } else {
                callback(null, imgObj)
            }
        }else{

        callback(null, imgObj);
        }
    }

    function updateImageObj(imgObj, callback) {
        imagesPersistent.update(imgObj, dbconnection,function(err){
            callback(err, imgObj);
        })
    }


    router.delete('/:imgid', function(req, res) {
        var imgid = req.params.imgid;
        // imagesPersistent.remove(imgid, dbconnection, messaging.bind(res));
        async.waterfall([deleteImage, deleteRecord], messaging.bind(res))

        function deleteImage(callback) {
            imagesPersistent.get(imgid, dbconnection, function(err, data) {
                var img_path = (data[0] || {}).path || ''
                if (!err && img_path) fs.unlink(img_path, function(err) {})
                var img_thumb = (data[0] || {}).thumb || ''
                if (!err && img_thumb) fs.unlink(img_thumb, function(err) {})
                callback(err)
            })
        }

        function deleteRecord(callback) {
            imagesPersistent.remove(imgid, dbconnection, function(err, data) {
                var ok = !err || (data.affectedRows == 1)
                callback(ok ? null : new Error('Can\'t delete this image'))
            })
        }
    });

    return router
}

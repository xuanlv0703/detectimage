var router = require('express').Router();
var imagesPersistent = require('../models/images.js');
var messaging = require('../uses').messaging;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './source/uploads' });
var async = require('async');
var request = require('request');
var config = require('../config');
var Jimp = require('jimp');
var path = require('path');
var facedetect = require('./facedetect');
var fs = require('fs.extra'); // extra functionality

var thumb = [400, 300];

module.exports = uploadAPI;

var crop = {

    inner: function innerCrop(output, image) {
        var base = baseScale(image.bitmap, false);
        image.resize.apply(image, base.thumb)
            // .crop(0, 0, thumb[0], thumb[1])
            .crop.apply(image, base.position.concat(thumb))
            .write(output);
    },

    outer: function outerCrop(output, image) {
        var base = baseScale(image.bitmap, true);
        // parameters for compositing image
        var prms = [image].concat(base.position);
        var white = new Jimp( // create a white background
            thumb[0], thumb[1], 0xFFFFFFFF,
            function(err, bg) {
                // resize bitmap data of original
                image.resize.apply(image, base.thumb);
                // paste resized img on white background
                bg.composite.apply(bg, prms).write(output);
            })
    }

}

function createThumbnail(filename, fileoutput) {
    Jimp.read(filename)
        .then(crop["outer"].bind({}, fileoutput))
        .catch(function(err) {
            console.error('ERROR while imaging...', err);
        });
}

function baseScale(bmp, reverse) {
    var ratio = bmp.width / bmp.height;
    var idx = ((thumb[0] / thumb[1]) >= ratio) ^ reverse;
    var resizing = idx ? (thumb[+!idx] / ratio) : (thumb[+!idx] * ratio);
    var dimension = Array.apply({}, thumb),
        cropStart = [0, 0];

    dimension[idx] = Jimp.AUTO; // apply auto resize 
    // calculate starting position for cropping
    if (reverse) cropStart[idx] = thumb[idx] - resizing;
    else cropStart[idx] = resizing - thumb[idx];
    cropStart[idx] = Math.round(cropStart[idx] / 2);

    console.log('ratio=', ratio, 'index=', idx,
        'original=', [bmp.width, bmp.height],
        'resizing=', resizing, 'dimension=', dimension,
        'cropStart=', cropStart)

    return { thumb: dimension, position: cropStart }
}

function uploadAPI(app) {
    var dbconnection = app.get('dbpool');
    router.post('/:uid', multipartMiddleware, function(req, res, next) {
        req.userFolder = './source/uploads/' + req.params.uid;
        // if (!fs.existsSync(req.userFolder)) {
        //     fs.mkdirSync(req.userFolder);
        //     fs.mkdirSync(req.userFolder + '/thumb');
        // }
        next();
    }, function(req, res) {
        var files = req.files.file_data
        if (!Array.isArray(files)) files = [files]
        files.map(function(img) {
            var fileName = path.basename(img.path);
            img.uid = req.body.id;
            img.aid = req.body.aid;
            img.thumb = req.userFolder + '/thumb/' + fileName;
            img.uploaded = img.path;
            img.path = req.userFolder + '/' + fileName;
            fs.move(img.uploaded, img.path, function(err) {
                if (err) return;
                createThumbnail(img.path, './' + img.thumb);
            });
        })

        var albumname = req.body.albumname;
        var albumkey = req.body.albumkey;
        var isRecognize = req.body.isRecognize == 'true';

        async.waterfall([
            insertFileData,
            selectFromPaths,
            automatedTagging
        ], messaging.bind(res));

        function insertFileData(callback) {
            imagesPersistent.save(files, dbconnection, function(err, data) {
                callback(err)
            });
        }

        function selectFromPaths(callback) {
            var paths = files.map(function(img) {
                return img.path })
            imagesPersistent.frompaths(paths, dbconnection, function(err, data) {
                callback(err, data)
            })
        }

        function automatedTagging(files, callback) {
            var automated = files.map(function(data) {
                data.personid = [];
                data.personobj = null;
                return recognizeImage.bind(recognizeImage, data)
            })
            async.parallel(automated, function(error, results) {
                callback(error, results)
            })
        }

        function recognizeImage(file, callback) {
            // console.log(file);
            if (!isRecognize){
                detectTags(file, callback)
            }else{
                facedetect.recognize(albumname, albumkey, file.path, function(stt, body) {
                    // console.log(body.photos[0].tags);
                    if (stt == 200) {
                        file.personobj = body.photos[0];
                        body.photos[0].tags.forEach(function(tag){
                            if(tag.uids == undefined )tag.uids=[];
                            var person = tag.uids.sort(
                                function (a, b) { 
                                    return b.confidence - a.confidence 
                                })[0]
                            if (!!person && person.confidence > 0.5 && file.personid.indexOf(person.prediction) < 0) {
                                file.personid.push(person.prediction)
                            }
                        })
                    }
                    detectTags(file, callback)
                })
            }
        }

        function detectTags(file, callback) {
            request.post({
                    url: 'http://' + config.host + ':' + config.port + '/api/detect',
                    form: { filePath: file.path },
                },
                function(error, response, body) {
                    body = JSON.parse(body);
                    file.title = body.title;
                    file.tags = body.tags;
                    file.alltags = body.alltags;
                    file.lat = body.gps.lat;
                    file.lon = body.gps.lon;
                    file.city = body.gps.cities;
                    file.colors = body.colors.accentColor;
                    imagesPersistent.update(
                    // {
                    //     tags: body.tags,
                    //     title: body.title,
                    //     alltags: body.alltags,
                    //     lat: body.gps.lat,
                    //     lon: body.gps.lon,
                    //     city: body.gps.cities,
                    //     id: file.id,
                    //     colors: body.colors.accentColor,
                    //     personid: file.personid,
                    //     personobj: file.personobj
                    // }
                    file
                    , dbconnection, function(err, data) {
                        console.log(err)
                    })
                    callback(error, file)
                })
        }
    });

    return router
}

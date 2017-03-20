var router = require('express').Router();
var imagesPersistent = require('../models/images.js');
var cityPersistent = require('../models/city.js');
var facedetect = require('./facedetect');
var messaging = require('../uses').messaging;
var _ = require('underscore');


module.exports = detectAPI;

function detectAPI(app) {
    var dbconnection = app.get('dbpool');
    router.post('/', function(req, res) {
        // console.info('body=', req.body)
        var filePath = req.body.filePath;
        formData = fs.readFileSync(filePath);
        totalResult(filePath,res, formData)
    });
    router.post('/face', function(req, res) {
        var imgpath = req.body.imgpath;
        var albumname = req.body.albumname;
        var albumkey = req.body.albumkey;
        var result = {
            personid : []
        }
        facedetect.recognize(albumname, albumkey, imgpath, function(stt, body) {
            if (stt == 200) {
                result.personobj = body.photos[0];
                body.photos[0].tags.forEach(function(tag){
                    if(tag.uids == undefined )tag.uids=[];
                    var person = tag.uids.sort(
                        function (a, b) { 
                            return b.confidence - a.confidence 
                        })[0]
                    if (!!person && person.confidence > 0.5 && result.personid.indexOf(person.prediction) < 0) {
                        result.personid.push(person.prediction)
                    }
                })
            }
            console.log(result)
            messaging.call(res, null, result)
        })
    });




//begin 
var unirest = require("unirest");
    var request = require('request'),
        // apiKey = 'acc_94129a9e6f11e84 ',
        // apiSecret = '9291162050501da0ff1640e3ca01637b';
        apiKey = 'acc_48307d78b5ec2b1';
        apiSecret = 'bba14f76489939f1f7ceed8ef61efb7b';

var async = require('async');
//upload image to cloud server
var fs = require('fs');
function createFormData(filePath,callback) {
        formData = {
            image: fs.createReadStream(filePath)
        };
    callback(null, formData)
}

function postImage(arg1, callback) {

    request.post({ url: 'https://api.imagga.com/v1/content', formData: arg1, headers: {
    'content-type': 'application/x-www-form-urlencoded'
  } },
        function(error, response, body) {
            var data = JSON.parse(body)
            var id = data.uploaded[0].id;
            callback(null, id);
        }).auth(apiKey, apiSecret, true);
}

function getContent(arg1, callback) {
    request.get('https://api.imagga.com/v1/tagging?content=' + arg1, function(error, response, body) {
        var data = JSON.parse(body)
        var tags = []
        if(data.results !== undefined){
            tags = data.results[0].tags
        }
        callback(null, tags);
    }).auth(apiKey, apiSecret, true);
}

function myProcess(arg1, callback) {
    callback(null, arg1);
}

//microsoft api
function detectMicrosoft(callback, imgdata) {
    var req = unirest("POST", "https://api.projectoxford.ai/vision/v1.0/analyze");
    req.query({
        "visualFeatures": 'tags,color,Description,Categories',
        "language": "en"
    });

    req.headers({
        "Ocp-Apim-Subscription-Key": "aff897d767554595aa12e81fe533d08f",
        "Content-Type": "application/json"
    });

    req.multipart([{
        'content-type': 'application/json',
        body: imgdata
    }]);

    req.end(function(res) {
        // if (res.error) throw new Error(res.error);
        callback(null, res.body);
    });

}

function detectGPS(callback,imgdata){
   try{
        var parser = require('exif-parser').create(imgdata);
        var result = parser.parse();
        var lat = result.tags.GPSLatitude;
        var lon = result.tags.GPSLongitude;
    }catch(err){
        console.log(err)
    }
    
    if(lat===undefined){
        lat = null;
    }
    if(lon === undefined){
        lon = null;
        var gpsObj = {lat:lat,lon:lon,cities:[]};
        callback(null,gpsObj);
    }
    else{
        cityPersistent.gettopfivebygps(lat,lon,dbconnection,function(err,data){
            var city = [];
            if(!err){
                _.each(data, function(ea) {
                    city.push(ea.city);
                });
            }
            var gpsObj = {lat:lat,lon:lon,cities:city};
            callback(null,gpsObj);
        })
    }
    // var gpsObj = {lat:lat,lon:lon};
}

function totalResult(filePath,res, imgdata) {
    async.parallel({
        one: function(callback) {
            async.waterfall([
            	async.constant(filePath),
                createFormData,
                postImage,
                getContent,
                myProcess
            ], function(err, result) {
                callback(null, result);
            });
        },
        two: function(callback) {
            detectMicrosoft(callback, imgdata)
        },
        three:function(callback){
            detectGPS(callback,imgdata)
        }
    }, function(err, results) {
        var miTags = results.two.tags;
        var miColors = results.two.color;
        var miTitle = 'Default title'
        if( results.two.description != undefined ){
            if(results.two.description.captions.length){
                 miTitle = results.two.description.captions[0].text;
            }
        }
       
        var data = joinTags(results.one,miTags);
        var allTags = miTags.concat(results.one);

        res.json({tags:data,gps:results.three,colors:miColors,title:miTitle,alltags:getTags(allTags)});
    });
}

function joinTags(a,b){
    var result = [];

_.each(a, function(ea) {
    var entry = _.find(b, function(eb) {return ea.tag == eb.name;});
    if (entry) result.push(entry.tag || entry.name);
});
return result;
}

function getTags(a){
    var result = [];

_.each(a, function(ea) {
    result.push(ea.tag || ea.name);
});
return result;
}

    return router
}
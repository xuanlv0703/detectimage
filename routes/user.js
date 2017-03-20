var router = require('express').Router();
var userPersistent = require('../models/user.js');
var messaging = require('../uses').messaging;
var uuid = require('node-uuid');
var async = require('async');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var randomstring = require("randomstring");
var md5 = require('md5');
var config = require('../config');
var getSize = require('get-folder-size');
var fs = require('fs.extra'); // extra functionality
var facedetect = require('./facedetect.js');
module.exports = userAPI;

function userAPI(app) {
    var dbconnection = app.get('dbpool');

    router.put('/login', function(req, res) {
        var user = req.body;

        userPersistent.login(user, dbconnection, function(err, data) {
            var message = messaging(err, data);
            if (!err) {
                message.token = app.get('jwt').sign(user, app.get('secret'), { expiresIn: 24 * 3600 })
            }
            res.jsonp(message)
        })
    });	

    router.put('/subscription', function(req, res) {
        var user = req.body;
        userPersistent.activeSubscription(user, dbconnection, messaging.bind(res));
    });
    router.get('/subscription/:uid', function(req, res) {
        var uid = req.params.uid;
        userPersistent.getSubscriptionID(uid, dbconnection, function(err, data){
            var message = messaging(err);
            message.data = (data[0] || {}).subscription || 0;
            res.jsonp(message)
        });
    });

    router.get('/', function(req, res) {
        userPersistent.getAllUser(dbconnection, messaging.bind(res));
    });

    router.post('/register',function(req,res){
        var objUser = req.body;
        async.parallel({
        one: function(callback) {
            //check username
             userPersistent.checkExistUser(objUser,dbconnection,function(err,data){
                var message = "";
                if(data.length >0){
                    message = "Username is exist";
                }
                callback(err,message)
             })
        },
        two: function(callback) {
            //check email
            userPersistent.checkExistEmail(objUser,dbconnection,function(err,data){
                var message = "";
                if(data.length >0){
                    message = "Email is exist";
                }
                callback(err,message);
             })
        }
    }, function(err, results) {
        //if no err create user
        if(results.one == '' && results.two == ''){
            objUser.albumname = '' + Date.now();
            // facedetect.createAlbum(objUser.username,function(albumkey){
            facedetect.createAlbum(objUser.albumname,function(albumkey){
            objUser.albumkey = albumkey;
            userPersistent.signup(objUser,dbconnection,function(err,data){
                objUser.id= data.insertId;
                var userFolder = './source/uploads/' + objUser.id;
                if (!fs.existsSync(userFolder)) {
                    fs.mkdirSync(userFolder);
                    fs.mkdirSync(userFolder + '/thumb');
                }
                var arrObjUser = [objUser];
                var message = messaging(err, arrObjUser);
                if (!err) {
                    message.token = app.get('jwt').sign(objUser, app.get('secret'), { expiresIn: 24 * 3600 })
                }
                res.jsonp(message)
         })
            })
        }else{
            res.jsonp({error:true,message:{username:results.one,email:results.two}})
        }
        

    });

    });

    router.post('/forgot', handleSayHello);

 

function checkExistEmail(objUser,callback){
   userPersistent.checkExistEmail(objUser,dbconnection,function(err,data){
            var message = "";
            var newpass = "";
            if(data.length >0){
                message = "Email is exist";
                newpass = randomstring.generate({
                                  length: 8,
                                  charset: 'alphabetic'
                                });
                objUser.password = md5(newpass);
                userPersistent.newpass(objUser,dbconnection,function(err1,data1){

                })
            }
            callback(null,newpass,objUser);
         })
}

function sendEmail(agr1,agr2,callback){
    if(agr1 != ""){
        var receiverEmail = agr2.email;
        var transporter = nodemailer.createTransport(config.servermail);
        var text = 'Your new password: '+agr1 ;
        var mailOptions = {
            from: 'xuan@rasia.info', // sender address
            to: receiverEmail, // list of receivers
            subject: 'Photo Hub Team', // Subject line
            text: text //, // plaintext body
            // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
                callback(error,null);
            }else{
                callback(null,'success');
            };
        });
    }else{
        callback(null,null);
    }

}

    function handleSayHello(req, res) {

        var objUser = req.body;
        var email = req.body.email;

        async.waterfall([
            async.constant(objUser),
            checkExistEmail,
            sendEmail
        ], function(err, result) {
            if(result == null){
                res.json({error:true,message:"Email is not exist."});
            }else{
                res.json({error:false,message:"Please check email for get new password."});
            }
        });
    }


    function checkOldPass(objUser,callback){
        userPersistent.login(objUser,dbconnection,function(err,data){
            if(!err && data.length>0){
                callback(null,true,objUser);
            }else{
                callback(null,false,objUser);
            }
        })
    }

    function changePass(agr1,agr2,callback){
        if(agr1){
            var objUser = agr2;
            objUser.password = agr2.newpass;
            userPersistent.newpass(objUser,dbconnection,function(err,data){
                if(!err){
                    callback(null,true);
                }else{
                    callback(null,false);
                }
            })
        }else{
            callback(null,false);
        }
    }

    router.post('/changepass',function(req,res){
        var objUser = req.body;
        objUser.name = req.body.username;
        async.waterfall([
            async.constant(objUser),
            checkOldPass,
            changePass
        ], function(err, result) {
            if(!result){
                res.json({error:true,message:"Old password not correct."});
            }else{
                res.json({error:false,message:"Password had changed."});
            }
        });
    })

    // profile function
    router.get('/profileInfo/:uid',function(req,res){
        var uid = req.params.uid;
        userPersistent.getProfileInfo(uid,dbconnection,function(err,data){
            var userPath = './source/uploads/' + uid ;
            objUser = data[0];
            objUser.subscription = +objUser.subscription||0 ;
            if (!fs.existsSync(userPath)) {
                fs.mkdirSync(userPath);
                fs.mkdirSync(userPath + '/thumb');
            }
            getSize(userPath, function(err, size) {
                objUser.totalDiskUsed = (size / Math.pow(1024, 3)).toFixed(3);
                var message = messaging(err, objUser);
                res.jsonp(message)
            });
        })
    })
    router.get('/profileImage/:uid',function(req,res){
        var uid = req.params.uid;
        userPersistent.getProfileImage(uid,dbconnection,messaging.bind(res));
    })

    return router
}
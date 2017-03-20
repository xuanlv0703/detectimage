var router = require('express').Router();
var menuPersistent = require('../models/menu.js');
var messaging = require('../uses').messaging;
var config = require('../config');
var uuid = require('node-uuid');
var unirest = require('unirest');
var fs = require('fs');
    	
    exports.createAlbum = function(albumname,cb){
    	var albumkey = '';
    	unirest.post("https://lambda-face-recognition.p.mashape.com/album")
		.header("X-Mashape-Key", config.mashapekey)
		.header("Content-Type", "application/x-www-form-urlencoded")
		.header("Accept", "application/json")
		.send("album="+albumname)
		.end(function (result) {
		    if(result.status == 200){
				   albumkey = result.body.albumkey;

				  }
				  console.log(albumkey);
				  cb(albumkey);
		});
    }

    exports.trainAlbum = function(albumname,albumkey,entryid,filename,cb){
    	unirest.post("https://lambda-face-recognition.p.mashape.com/album_train")
		.header("X-Mashape-Key", config.mashapekey)
		.field("album", albumname)
		.field("albumkey", albumkey)
		.field("entryid", entryid)
		.attach("files", fs.createReadStream(filename))
		.end(function (result) {
		  cb(result.status,result.body);
		});
    }

    exports.rebuildAlbum = function(albumname,albumkey,cb){
    	unirest.get("https://lambda-face-recognition.p.mashape.com/album_rebuild?album="+albumname+"&albumkey="+albumkey)
		.header("X-Mashape-Key", config.mashapekey)
		.header("Accept", "application/json")
		.end(function (result) {
		  cb(result.status,result.body);
		});
    }

    exports.detect = function (filename,cb){
    	unirest.post("https://lambda-face-recognition.p.mashape.com/detect")
		.header("X-Mashape-Key", config.mashapekey)
		.attach("files", fs.createReadStream(filename))
		.end(function (result) {
		  cb(result.status,result.body);
		});
    }

    exports.recognize =function (albumname,albumkey,filename,cb){
    	 unirest.post("https://lambda-face-recognition.p.mashape.com/recognize")
		.header("X-Mashape-Key", config.mashapekey)
		.field("album", albumname)
		.field("albumkey", albumkey)
		.attach("files", fs.createReadStream(filename))
		.end(function (result) {
		  cb(result.status,result.body);
		});
    }

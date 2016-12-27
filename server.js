var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views'); // general config
app.set('view engine', 'html');
app.use(express.static(__dirname));
// app.use(express.static(__dirname + '/assets'));
// default options 
app.use(fileUpload());
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})
app.get('/user', function(req, res) {
    // res.render('user',{ data: result});
    res.sendFile(__dirname + '/views/user.html')
})

app.post('/upload', function(req, res) {
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    sampleFile = req.files.sampleFile;
    sampleFile.mv('./img/filename.jpg', function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            //call async
            totalResult(res, sampleFile.data);
            //res.send('File uploaded!');

        }
    });
});
var unirest = require("unirest");
    var request = require('request'),
        apiKey = 'acc_94129a9e6f11e84 ',
        apiSecret = '9291162050501da0ff1640e3ca01637b';

var async = require('async');
//upload image to cloud server
var fs = require('fs');
function createFormData(callback) {
    filePath = './img/filename.jpg',
        formData = {
            image: fs.createReadStream(filePath)
        };
    callback(null, formData)
}

function postImage(arg1, callback) {

    request.post({ url: 'https://api.imagga.com/v1/content', formData: arg1 },
        function(error, response, body) {
            var data = JSON.parse(body)
            var id = data.uploaded[0].id;
            callback(null, id);
        }).auth(apiKey, apiSecret, true);
}

function getContent(arg1, callback) {
    request.get('https://api.imagga.com/v1/tagging?content=' + arg1, function(error, response, body) {
        var data = JSON.parse(body)
        callback(null, data.results[0].tags);
    }).auth(apiKey, apiSecret, true);
}

function myProcess(arg1, callback) {
    callback(null, arg1);
}

//microsoft api
function detectMicrosoft(callback, imgdata) {
    var req = unirest("POST", "https://api.projectoxford.ai/vision/v1.0/analyze");
    req.query({
        "visualFeatures": 'tags',
        "language": "en"
    });

    req.headers({
        "Ocp-Apim-Subscription-Key": "aff897d767554595aa12e81fe533d08f",
        "Content-Type": "application/json"
    });

    // req.send({"url":"https://imagga.com/static/images/alienware_15.png"});
    req.multipart([{
        'content-type': 'application/json',
        body: imgdata
    }]);

    req.end(function(res) {
        // if (res.error) throw new Error(res.error);
        callback(null, res.body.tags);
    });
}

function totalResult(res, imgdata) {
    async.parallel({
        one: function(callback) {
            async.waterfall([
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
        }
    }, function(err, results) {
        res.render('user', { data: results.one, data1: results.two });
    });
}

app.listen(3000);

console.log("Running at Port 3000");

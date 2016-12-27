// var unirest = require("unirest");

// var req = unirest("GET", "http://api.imagga.com/v1/tagging");
// var img1= 'http://playground.imagga.com/static/img/example_photos/StockPodium_7366126_Portrait-of-a-dog.jpg'
// var img2= 'http://playground.imagga.com/static/img/example_photos/StockPodium_7292520_blog_portrait-of-a-little-girl-in-a-hat-on-gray-background.jpg';
// var img3= 'http://playground.imagga.com/static/img/example_photos/parrot-620345_1280.jpg';
// var img4= '/img/chickend1.jpg';
// var img5 ='http://playground.imagga.com/static/img/example_photo.jpg';
// req.query({
//   "url": img3,
//   "version": "2"
// });

// req.headers({
//   "authorization": "Basic YWNjXzk0MTI5YTllNmYxMWU4NDo5MjkxMTYyMDUwNTAxZGEwZmYxNjQwZTNjYTAxNjM3Yg==",
//   "accept": "application/json"
// });


// req.end(function (res) {
//   if (res.error) throw new Error(res.error);
//   // console.log(res)

//   console.log(res.body.results[0].tags);
// });



var request = require('request'),
    apiKey = 'acc_94129a9e6f11e84 ',
    apiSecret = '9291162050501da0ff1640e3ca01637b',
    imageUrl = 'https://imagga.com/static/images/tagging/wind-farm-538576_640.jpg';
    imagga11 = 'https://imagga.com/static/images/alienware_15.png';

var async = require('async');
//upload image to cloud server
var fs = require('fs'),
    request = require('request'),
  
    filePath = './img/dog.jpg',
    formData = {
        image: fs.createReadStream(filePath)
    };
    console.log(formData)
//   var id = '';
// request.post({url:'https://api.imagga.com/v1/content', formData: formData},
//     function (error, response, body) {
//         console.log('Status:', response.statusCode);
//         console.log('Headers:', JSON.stringify(response.headers));
//         console.log('Response:', body);
//         var data = JSON.parse(body)
//         id =data.uploaded[0].id;
//         console.log(id)
//     }).auth(apiKey, apiSecret, true);
// //end upload

// //analysis image url
// request.get('https://api.imagga.com/v1/tagging?url='+encodeURIComponent(imagga11), function (error, response, body) {
//     console.log('Status:', response.statusCode);
//     console.log('Headers:', JSON.stringify(response.headers));
//     var data = JSON.parse(body)
//     console.log('Response:', data.results[0].tags);
// }).auth(apiKey, apiSecret, true);
// //end

// //analysis image content id
// request.get('https://api.imagga.com/v1/tagging?content=8687477ab73b8dc2147dff789f76f552', function (error, response, body) {
//     console.log('Status:', response.statusCode);
//     console.log('Headers:', JSON.stringify(response.headers));
//     var data = JSON.parse(body)
//     console.log('Response:', data.results[0].tags);
// }).auth(apiKey, apiSecret, true);
// //end

//call async
async.waterfall([
    postImage,
    getContent,
    myProcess
], function (err, result) {
    // result now equals 'done'
    console.log(result)
});
function postImage(callback) {
    
    request.post({url:'https://api.imagga.com/v1/content', formData: formData},
    function (error, response, body) {
        var data = JSON.parse(body)
        var id =data.uploaded[0].id;
        callback(null,id);
    }).auth(apiKey, apiSecret, true);
}
function getContent(arg1, callback) {
    console.log(arg1);
    request.get('https://api.imagga.com/v1/tagging?content='+arg1, function (error, response, body) {
	    var data = JSON.parse(body)
	    callback(null, data.results[0].tags);
	}).auth(apiKey, apiSecret, true);
}
function myProcess(arg1, callback) {
    console.log(arg1);
    callback(null, 'done');
}
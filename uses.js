// format query's results
module.exports.messaging = function (err, data) {
    var message = {
        "Error": !!err,
        "Message": err ? "Error execution" : "Success"
    };
    // console.log('err, data=', arguments)
    if (!err && data) message.data = data;
    // this = < response object >
    try { this.jsonp(message) }
    catch (e) { return message }
}

// (try to) load corresponding model file
module.exports.models = function (file) {
    try { return require('./model/' + file) }
    catch (e) {
        console.error('Model file < %s > not found!', file)
    }
}
var mysql = require('mysql');

exports.getall = function(connection, done) {
    var query = "SELECT asu.* FROM a003_subscriptions asu";
    query = mysql.format(query);
    connection.query(query, done);
};

exports.create = function(objSub, connection, done) {
    var query = "INSERT INTO a003_subscriptions(title,price,imagerecognized,album,facedefined,diskspace,imagesize) VALUE(?,?,?,?,?,?,?)";
    var table = [objSub.title,objSub.price,objSub.imagerecognized,objSub.album,objSub.facedefined,objSub.diskspace,objSub.imagesize];
    query = mysql.format(query, table);
    connection.query(query, done);
}

exports.edit = function(objSub, connection, done) {
    var query = "UPDATE a003_subscriptions SET title=?,price=?,imagerecognized=?,album=?,facedefined=?,diskspace=?,imagesize=? where id = ?";
    var table = [objSub.title,objSub.price,objSub.imagerecognized,objSub.album,objSub.facedefined,objSub.diskspace,objSub.imagesize,objSub.id];
    query = mysql.format(query, table);
    connection.query(query, done);
}


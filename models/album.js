var mysql = require('mysql');

exports.getall = function(uid,connection, done) {
    var query = "SELECT alb.* FROM a003_album alb WHERE uid = ?";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.create = function(objAlbum, connection, done) {
	var created = new Date();
    var query = "INSERT INTO a003_album(uid,title,description,created) VALUE(?,?,?,?)";
    var table = [objAlbum.uid,objAlbum.title,objAlbum.description,created];
    query = mysql.format(query, table);
    connection.query(query, done);
}
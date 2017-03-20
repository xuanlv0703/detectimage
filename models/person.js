var mysql = require('mysql');

exports.getperson = function(pid,connection, done) {
    var query = "SELECT ps.* FROM a003_person ps WHERE ps.id = ?";
    var table = [pid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.newperson = function(pid,pname,tnum,uid,connection, done) {
    var query = "insert into a003_person(id,name,tnum,uid)values(?,?,?,?)";
    var table = [pid,pname,tnum,uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.updatetnum = function(pid,tnum,connection, done) {
    var query = "update a003_person set tnum=? where id=?";
    var table = [tnum,pid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.getall = function(uid,connection, done) {
    var query = "SELECT ps.* FROM a003_person ps WHERE ps.uid = ?";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};


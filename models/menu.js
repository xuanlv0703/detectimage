var mysql = require('mysql');


exports.getAll = function(connection, done) {
    var query = "SELECT * FROM menu WHERE active = 1";
    query = mysql.format(query);
    connection.query(query, done);
};

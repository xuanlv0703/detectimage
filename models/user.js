var mysql = require('mysql');


exports.signup = function(objUser, connection, done) {
    var query = "INSERT INTO a003_users(username,email,password,firstname,lastname,albumname,albumkey,isactive) VALUE(?,?,?,?,?,?,?,?)";
    var table = [objUser.username,objUser.email,objUser.password,objUser.firstname,objUser.lastname,objUser.albumname,objUser.albumkey,1];
    query = mysql.format(query, table);
    connection.query(query, done);
}

exports.newpass = function(objUser,connection,done){
    var query = "UPDATE a003_users SET password=? where email=?";
    var table = [objUser.password,objUser.email];
    query = mysql.format(query, table);
    connection.query(query, done);
}

exports.checkExistUser = function(objUser,connection,done){
	var query = "select * from a003_users where username = ?"
	var table = [objUser.username];
	query = mysql.format(query, table);
    connection.query(query, done);
}

exports.checkExistEmail = function(objUser,connection,done){
	var query = "select * from a003_users where email = ?"
	var table = [objUser.email];
	query = mysql.format(query, table);
    connection.query(query, done);
}

exports.login = function(user, connection, done) {
    var query = "select * from a003_users where username = ? and password = ?";
    var table = [user.name, user.password];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.activeSubscription = function(user, connection, done) {
    var query = "update a003_users set subscription = ?,hiredate = now() where id = ? ";
    var table = [user.sid, user.uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};
exports.getSubscriptionID = function(uid, connection, done) {
    var query = "select subscription from a003_users where id = ? ";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.getAllUser= function(connection,done){
    var query = "select * from a003_users";
    query = mysql.format(query);
    connection.query(query, done);
}

exports.getProfileInfo= function(uid,connection,done){
    var query = "select au.*,asub.* , (select count(*) from a003_images ai where ai.uid = au.id ) as imageuploaded , (select count(*) from a003_album aa where aa.uid = au.id ) as albumcreated from a003_users au LEFT JOIN a003_subscriptions asub ON au.subscription = asub.id where au.id=? ";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
}

exports.getProfileImage= function(uid,connection,done){
    var query = "select title,thumb from a003_images where uid=? Order by RAND() limit 7";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
}


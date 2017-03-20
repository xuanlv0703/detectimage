var mysql = require('mysql');
var slash = require('slash');

exports.save = function(imgObj,connection, done) {
    var query = "INSERT INTO a003_images(path,thumb,uid,tags,aid,created) VALUES ";
    // var table = [imgObj.path,imgObj.uid,imgObj.tags,imgObj.aid];
    var rows = [], table = []
    imgObj.map(function(img) {
        rows.push('(?,?,?,?,?,now())')
        table.push(slash(img.path),img.thumb, img.uid, img.tags || '', img.aid)
    })
    query = mysql.format(query + rows.join(", "), table);
    connection.query(query, done);
}

exports.getall = function(uid,connection, done) {
    var query = "SELECT img.*,alb.title as album FROM a003_images img LEFT JOIN a003_album alb ON img.aid = alb.id WHERE img.uid = ?";
    var table = [uid];
    query = mysql.format(query, table);
    connection.query(query, done);
};

exports.update = function(imgObj,connection, done) {
    var query = "UPDATE a003_images SET tags=?,lat=?,lon=?,city=?,title=?,colors=?,alltags=?,personid=?,personobj=?,istemplate=?  WHERE id=?"; 
    var tags = imgObj.tags.join(";");
    var alltags = imgObj.alltags.join(";");
    var lat = imgObj.lat;
    var lon = imgObj.lon;
    var city = imgObj.city.join(";");
    var title = imgObj.title;
    var id = imgObj.id;
    var colors = imgObj.colors;
    var personid = imgObj.personid.join(";");
    var personobj = JSON.stringify(imgObj.personobj) ;
    var istemplate = imgObj.istemplate;
    console.log(personobj)
    var table = [tags,lat,lon,city,title,colors,alltags,personid,personobj,istemplate,id];
    query = mysql.format(query, table);
    connection.query(query, done);
    
}


exports.get = function(imgid,connection, done) {
    var query = "SELECT * from a003_images WHERE id=?"; 
    var table = [imgid];
    query = mysql.format(query, table);
    connection.query(query, done);
}

exports.remove = function(imgid,connection, done) {
    var query = "DELETE from a003_images WHERE id=?"; 
    var table = [imgid];
    query = mysql.format(query, table);
    connection.query(query, done);
}


exports.frompaths = function(paths,connection, done) {
    var query = "SELECT img.*,alb.title as album FROM a003_images img LEFT JOIN a003_album alb ON img.aid = alb.id WHERE path IN (?)";
    query = mysql.format(query, [paths.map(slash)]);
    connection.query(query, done);
};
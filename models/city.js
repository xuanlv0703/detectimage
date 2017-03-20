

var mysql = require('mysql');

exports.gettopfivebygps = function(lat,lon,connection, done) {
    var query = "SELECT *\
FROM (\
SELECT sqrt(c.lngDelta * c.lngDelta + c.latDelta * latDelta) as distance, c.* \
FROM (\
SELECT \
(? - longitude) * cos(latitude/3602*pi()) * 111194 as lngDelta,\
(? - latitude) * 111194 as latDelta, cities.* \
FROM cities \
WHERE \
longitude BETWEEN (? - 0.5) AND (? + 1.5) \
AND latitude BETWEEN (? - 0.5) AND (? + 1.5) \
) c\
) calc \
ORDER BY calc.distance \
limit 5";
    var table = [lon,lat,lon, lon , lat ,lat];
    query = mysql.format(query, table);
    console.log(query)
    connection.query(query, done);
};

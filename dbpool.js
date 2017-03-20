var mysql = require('mysql')
var pool, address

module.exports.connect = function (dbinf, done) {
  if (typeof done != 'function') done = function (err) { err && console.log(err) }
  if (!(dbinf instanceof Object)) done(new Error('Unknown information'))

  pool = mysql.createPool(dbinf)
  address = pool.config.connectionConfig.host + ':' + pool.config.connectionConfig.port
  console.info('Creating connection pool to database ....')

  pool.getConnection(function (conn_err, conn) {
    if (conn_err || conn == undefined) return done(conn_err)
    conn.query('SELECT @@version', function (err, rows) {
      if (Array.isArray(rows)) {
        console.log('DB info:' + rows[0]['@@version'], ', at', address)
      }; conn.release(), done(err)
    })
  })

  pool.on('connection', function (conn) {
    if (conn == undefined) return
    console.info('DB thread established #' + conn.threadId)
  })

  return pool
}

module.exports.close = function (func) {
  if (pool) pool.end(func)
}
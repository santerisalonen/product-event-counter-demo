require('dotenv').config()
const mysql = require( 'mysql' );

exports.handler = function(event, callback){
  let connection = mysql.createConnection({
    host     : process.env.DBHost,
    user     : process.env.DBUser,
    password : process.env.DBPassword,
    database : process.env.DBName,
    port : process.env.DBPort
  });
  let respond = function(statusCode, data){
    connection.end(function(){
      callback({
        statusCode : statusCode,
        headers : { "Content-Type" : "application/json" },
        body : JSON.stringify(data)
      });
    });
  }

  // Todo: Implement
  respond(204, "Not implemented");


}

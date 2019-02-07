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

  let action = '';
  if(event.event == 'Impression') action = 'impressions';
  else if(event.event == 'DetailView') action = 'views';
  else if(event.event == 'Purchase') action = 'purchases';
  else respond(404, 'Action not implemented.');

  let sqlValues = '';
  event.products.forEach((v) => {
    sqlValues += `('${v.name}','${v.brand}',1),`;
  })
  //Remove comma from the end
  sqlValues = sqlValues.slice(0, -1)

  const sql = `INSERT INTO product_events (name, brand, ${action}) 
    VALUES ${sqlValues} 
    ON DUPLICATE KEY UPDATE ${action} = product_events.${action} + 1;`

  connection.query(sql, function(err, rows){
    if(err) return respond(404, "Event not found");
    else return respond(200, "Done");
  });

}

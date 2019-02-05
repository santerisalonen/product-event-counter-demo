/*
  run this script to setup required database table
*/
require('dotenv').config()
const mysql = require( 'mysql' );
let connection = mysql.createConnection({
  host     : process.env.DBHost,
  user     : process.env.DBUser,
  password : process.env.DBPassword,
  port : process.env.DBPort || 3306,
  multipleStatements: true
});

let sql = `
  CREATE DATABASE IF NOT EXISTS ??;
  USE ??;
  CREATE TABLE IF NOT EXISTS product_events (
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    impressions INT DEFAULT 0,
    views INT DEFAULT 0,
    purchases INT DEFAULT 0,
    UNIQUE(name, brand)
  ) DEFAULT CHARSET=utf8;
  DELETE FROM product_events;
`;

connection.query(sql, [process.env.DBName, process.env.DBName], function(err, rows){
  connection.end();
  if(err) console.log(err);
  else console.log(rows);
});

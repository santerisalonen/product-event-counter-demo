/*
*/
require('dotenv').config();
const test = require('tape-async');
const mysql = require( 'mysql' );
const lambda = require('./lambda');

const sendEvent = async function(event){
  return new Promise(function(resolve, reject){
    lambda.handler(event, function(response){
      resolve();
    });
  });
}
let connection;
const getTestDataFromDB = function(){
  return new Promise(function(resolve, reject){
    connection = mysql.createConnection({
      host     : process.env.DBHost,
      user     : process.env.DBUser,
      password : process.env.DBPassword,
      database : process.env.DBName,
      port : process.env.DBPort
    });
    connection.query(`
        SELECT brand, sum(impressions) AS impressions, sum(views) AS views, sum(purchases) as purchases
        FROM product_events GROUP BY brand`,
      function(err, rows){
        if(err) return reject(err);
        else return resolve(rows);
      });
  });
}

test('async', async function(t) {
  let testBrand = Math.random().toString(36).slice(2,12);
  let impressionEvent = {
    event : "Impression",
    products : [
      { name : "test-1", brand : testBrand },
      { name : "test-2", brand : testBrand },
      { name : "test-3", brand : testBrand }
    ]
  };
  let viewEvent = {
    event : "DetailView",
    products : [
      { name : "test-1", brand : testBrand },
      { name : "test-2", brand : testBrand }
    ]
  };
  let purchaseEvent = {
    event : "Purchase",
    products : [
      { name : "test-1", brand : testBrand },
    ]
  };
  // send events to lambda handler
  await Promise.all( [impressionEvent, viewEvent, purchaseEvent].map(sendEvent));

  // fetch data from DB
  let rows = await getTestDataFromDB();
  if(connection) connection.end();

  // get data for testBrand
  let brandStats = rows.filter(function(b){
    return b.brand == testBrand;
  });

  // test
  if(!brandStats.length) t.fail('No results found for brand ' + testBrand);
  else {
    t.equal(brandStats[0].impressions, 3, "3 impresssions found");
    t.equal(brandStats[0].views, 2, "2 detailviews found");
    t.equal(brandStats[0].purchases, 1, "1 purchases found");
  }




});

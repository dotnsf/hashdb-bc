//. app.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ./hashdb-bc.bna -i PeerAdmin -s secret

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    http = require( 'http' ),
    //sqlite3 = require( 'sqlite3' ).verbose(),
    app = express();
var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

const HyperledgerClient = require( './hyperledger-client' );
const client = new HyperledgerClient();

app.set( 'superSecret', settings.superSecret );

var port = appEnv.port || 3000;

/*
//. スキーマ作成
var db = new sqlite3.Database( ":memory:" );
db.serialize( function(){
  var sql0 = "CREATE TABLE ids( id text, type text, name text, txt text )";
  db.run( sql0 );

  //. Participants
  http.get( 'http://localhost:' + port + '/users', ( res ) => {
    var body = '';
    res.setEncoding( 'utf8' );

    res.on( 'data', ( chunk ) => {
      body += chunk;
    });
    res.on( 'end', ( chunk ) => {
      var users = JSON.parse( body );
      for( i = 0; i < users.length; i ++ ){
        var user = users[i];
        var sql1 = "INSERT INTO ids( id, type, name, txt ) VALUES( '" + user.id + "', 'participant', 'User', '" + user.name + " " + user.email + "')";
        db.run( sql1 );
      }
    });
  }).on( 'error', ( e ) => {
    console.log( e.message );
  });

  //. Assets
  http.get( 'http://localhost:' + port + '/items', ( res ) => {
    var body = '';
    res.setEncoding( 'utf8' );

    res.on( 'data', ( chunk ) => {
      body += chunk;
    });
    res.on( 'end', ( chunk ) => {
      var items = JSON.parse( body );
      for( i = 0; i < items.length; i ++ ){
        var item = items[i];
        var sql2 = "INSERT INTO ids( id, type, name, txt ) VALUES( '" + item.id + "', 'asset', 'Item', '" + item.name + " " + item.category + " " + item.desc + "')";
        db.run( sql2 );
      }
    });
  }).on( 'error', ( e ) => {
    console.log( e.message );
  });
});
*/

//app.use( multer( { dest: './tmp/' } ).single( 'file' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.get( '/doc', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/doc.ejs', 'utf-8' );
  res.write( ejs.render( template, {} ) );
  res.end();
});

app.get( '/', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/index.ejs', 'utf-8' );
  client.getAllUsers( users => {
    client.getAllFileObjs( slips => {
      res.write( ejs.render( template, { users: users, fileObjs: fileObjs } ) );
      res.end();
    }, error => {
      res.write( ejs.render( template, { users: users, fileObjs: [] } ) );
      res.end();
    });
  }, error => {
    client.getAllFileObjs( slips => {
      res.write( ejs.render( template, { users: [], fileObjs: fileObjs } ) );
      res.end();
    }, error => {
      res.write( ejs.render( template, { users: [], fileObjs: [] } ) );
      res.end();
    });
  });
});


var apiRoutes = express.Router();

apiRoutes.post( '/user', function( req, res ){
  var userId = req.body.userId;
  var name = req.body.name;

  var user = {
    userId: userId,
    name: name,
  };
  client.addUserTx( user, result => {
    res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
    res.end();
  }, error => {
    console.log( error );
    res.status( 500 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});

apiRoutes.post( '/users', function( req, res ){
  var users = [];
  if( req.body && req.body.length ){
    for( var i = 0; i < req.body.length; i ++ ){
      var userId = req.body[i].userId;
      var name = req.body[i].name;
      var user = { userId: userId, name: name };
      users.push( user );
    }
  }
  
  client.addUsersTx( users, result => {
    res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
    res.end();
  }, error => {
    console.log( error );
    res.status( 500 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});

apiRoutes.get( '/users', function( req, res ){
  client.getAllUsers( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 500 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

apiRoutes.get( '/user', function( req, res ){
  var userId = req.query.userId;

  client.getUser( userId, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 404 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

apiRoutes.delete( '/user', function( req, res ){
  var userId = req.body.userId;

  client.deleteUserTx( userId, result => {
    res.write( JSON.stringify( { status: true }, 2, null ) );
    res.end();
  }, error => {
    res.status( 404 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});



apiRoutes.get( '/fileObjs', function( req, res ){
  client.getAllFileObjs( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 500 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

apiRoutes.get( '/fileObj', function( req, res ){
  var fileObjId = req.query.fileObjId;

  client.getSlip( fileObjId, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 404 );
    res.write( JSON.stringify( message, 2, null ) );
    res.end();
  });
});

apiRoutes.post( '/fileObjs', function( req, res ){
  res.status( 501 );
  res.write( JSON.stringify( { status: false, message: 'Not implemented yet.' }, 2, null ) );
  res.end();
});

apiRoutes.post( '/fileObj', function( req, res ){
  var fileObjId = req.body.fileObjId;
  var url = req.body.url;
  var fileObj = {
    fileObjId: fileObjId,
    url: url,
  };
  if( req.body.userId ){
    fileObj.userId = req.body.userId;
  }

  client.addFileObjTx( fileObj, result => {
    res.write( JSON.stringify( { status: true, result: result }, 2, null ) );
    res.end();
  }, error => {
console.log( error );
    res.status( 500 );
    res.write( JSON.stringify( { status: false, message: error }, 2, null ) );
    res.end();
  });
});


apiRoutes.delete( '/fileObj', function( req, res ){
  var fileObjId = req.body.fileObjId;

  client.deleteFileObjTx( fileObjId, result => {
    res.write( JSON.stringify( { status: true }, 2, null ) );
    res.end();
  }, error => {
    res.status( 404 );
    res.write( JSON.stringify( { status: false, error: error }, 2, null ) );
    res.end();
  });
});

apiRoutes.post( '/query', function( req, res ){
  var name = req.body.name;
  var condition = { name: name };
  console.log( 'query: condition = ' + JSON.stringify( condition, 2, null ) );

  client.queryUsers( condition, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 403 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

apiRoutes.get( '/search', function( req, res ){
  var result = [];
  var q = req.query.q;
  var sql = "SELECT id ,type, name from ids where txt like '%" + q + "%'";
  db.all( sql, function( err, rows ){
    res.write( JSON.stringify( rows, 2, null ) );
    res.end();
  });
});

apiRoutes.get( '/test', function( req, res ){
  var transactionId = req.query.transactionId;
  client.queryTransaction( transactionId, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.status( 403 );
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.use( '/api', apiRoutes );

app.listen( port );
console.log( "server starting on " + port + " ..." );

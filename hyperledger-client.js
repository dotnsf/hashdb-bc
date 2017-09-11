//. hyperledger-client.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ./hashdb-bc.bna -i PeerAdmin -s secret
var settings = require( './settings' );

const NS = 'me.juge.hashdb';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const HyperledgerClient = function() {
  var vm = this;
  vm.businessNetworkConnection = null;
  vm.businessNetworkDefinition = null;

  vm.prepare = (resolved, rejected) => {
    if (vm.businessNetworkConnection != null && vm.businessNetworkDefinition != null) {
      resolved();
    } else {
      console.log('HyperLedgerClient.prepare(): create new business network connection');
      vm.businessNetworkConnection = new BusinessNetworkConnection();
      const connectionProfile = settings.connectionProfile;
      const businessNetworkIdentifier = settings.businessNetworkIdentifier;
      const participantId = settings.participantId;
      const participantPwd = settings.participantPwd;
      return vm.businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
      .then(result => {
        vm.businessNetworkDefinition = result;
        resolved();
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.prepare(): reject');
        rejected(error);
      });
    }
  };

  vm.addUserTx = (user, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'addUserTx');
      transaction.userId = user.userId;
      transaction.name = user.name;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        //resolved(result);
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.addUserTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.addUsersTx = (users, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'addUsersTx');
      transaction.userId = [];
      transaction.name = [];
      for( var i = 0; i < users.length; i ++ ){
        if( users[i].userId && users[i].name ){
          transaction.userId.push( users[i].userId );
          transaction.name.push( users[i].name );
        }
      }
      //console.log( transaction );
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        //resolved(result);
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.addUsersTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteUserTx = (userId, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'deleteUserTx');
      transaction.userId = userId;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        //resolved(result);
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.deleteUserTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.addFileObjTx = (fileObj, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'addFileObjTx');
      //console.log( transaction );
      transaction.fileObjId = fileObj.fileObjId;
      transaction.url = fileObj.url;
      if( fileObj.userId ){
        transaction.userId = fileObj.userId;
      }

      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.addFileObjTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.addFileObjsTx = (fileObjs, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'addFileObjsTx');
      transaction.fileObjId = [];
      transaction.userId = [];
      transaction.url = [];
      for( var i = 0; i < fileObjs.length; i ++ ){
        if( fileObjs[i].fileObjId && fileObjs[i].url ){
          transaction.fileObjId.push( fileObjs[i].fileObjId );
          transaction.url.push( fileObjs[i].url );
          if( fileObjs[i].userId ){
            transaction.userId.push( fileObjs[i].userId );
          }else{
            transaction.userId.push( null );
          }
        }
      }
      //console.log( transaction );
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        //resolved(result);
        var result0 = {transactionId: transaction.transactionId, timestamp: transaction.timestamp};
        resolved(result0);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.addFileObjsTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteFileObjTx = (fileObjId, resolved, rejected) => {
    vm.prepare(() => {
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'deleteFileObjTx');
      transaction.fileObjId = fileObjId;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.deleteFileObjTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getUser = (userId, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getParticipantRegistry(NS + '.User')
      .then(registry => {
        return registry.resolve(userId);
      }).then(user => {
        resolved(user);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.getUser(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAllUsers = ( resolved, rejected ) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getParticipantRegistry(NS + '.User')
      .then(registry => {
        return registry.getAll();
      })
      .then(users => {
        var result = [];
        let serializer = vm.businessNetworkDefinition.getSerializer();
        users.forEach( user => {
          result.push( serializer.toJSON(user) );
        });
        resolved(result);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.getAllUsers(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getFileObj = (fileObjId, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.FileObj')
      .then(registry => {
        return registry.resolve(fileObjId);
      }).then(fileObj => {
        resolved(fileObj);
      }).catch(error => {
        resolved(null);
      });
    }, rejected);
  };

  vm.getAllFileObjs = (resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.FileObj')
      .then(registry => {
        return registry.getAll();
      })
      .then(fileObjs => {
        var result = [];
        let serializer = vm.businessNetworkDefinition.getSerializer();
        fileObjs.forEach( fileObj => {
          result.push( serializer.toJSON(fileObj) );
        });
        resolved(result);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.getAllFileObjs(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.queryUsers = (condition, resolved, rejected) => {
    var where = '';
    var params = {};

    //. クエリー文を動的に作成してビルドする
    if( condition.name ){
      params['name'] = condition.name;
      //if( where.length > 0 ){
      //  where += ' AND ';
      //}
      where += 'name == _$name';
    }

    vm.prepare(() => {
      var select = 'SELECT me.juge.hashdb.User' + ( ( where.length > 0 ) ? ( ' WHERE (' + where + ')' ) : '' );
      var query = vm.businessNetworkConnection.buildQuery( select );

      return vm.businessNetworkConnection.query(query, params)
      .then(users => {
        var result = [];
        let serializer = vm.businessNetworkDefinition.getSerializer();
        users.forEach( user => {
          result.push( serializer.toJSON(user) );
        });
        resolved(result);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.query(): reject');
        console.log( error );
        rejected(error);
      });
    }, rejected);
  };

  vm.queryFileObjs = (condition, resolved, rejected) => {
    var where = '';
    var params = {};

    //. クエリー文を動的に作成してビルドする
    if( condition.user && condition.user.userId ){
      params['userId'] = condition.user.userId;
      //if( where.length > 0 ){
      //  where += ' AND ';
      //}
      where += 'user.userId == _$userId';
    }

    vm.prepare(() => {
      var select = 'SELECT me.juge.hashdb.FileObj' + ( ( where.length > 0 ) ? ( ' WHERE (' + where + ')' ) : '' );
      var query = vm.businessNetworkConnection.buildQuery( select );

      return vm.businessNetworkConnection.query(query, params)
      .then(fileObjs => {
        var result = [];
        let serializer = vm.businessNetworkDefinition.getSerializer();
        fileObjs.forEach( fileObj => {
          result.push( serializer.toJSON(fileObj) );
        });
        resolved(result);
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.query(): reject');
        console.log( error );
        rejected(error);
      });
    }, rejected);
  };

  vm.queryTransaction = (transactionId, resolved, rejected) => {
    //. Chain クラスの queryTransaction() ?
    //. https://jimthematrix.github.io/Chain.html

    //. TransactionRegistry クラスを利用する
    //. https://hyperledger.github.io/composer/jsdoc/module-composer-client.TransactionRegistry.html
    vm.prepare(() => {
      return vm.businessNetworkConnection.getTransactionRegistry()
      .then(registry => {
        return registry.get(transactionId);
      }).then(transaction => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        resolved({ status: true, transaction: serializer.toJSON(transaction) });
      }).catch(error => {
        console.log( error );
        console.log('HyperLedgerClient.queryTransaction(): reject');
        resolved({ status: false, message: error });
      });
    }, rejected);
  };
}

module.exports = HyperledgerClient;

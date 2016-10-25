var gtm = require('nodem');
var db = new gtm.Gtm();
var ok = db.open();

var DocumentStore = require('ewd-qoper8-gtm/node_modules/ewd-document-store');
var documentStore = new DocumentStore(db);

var queue = new documentStore.DocumentNode('ewdQueue');
var messages = queue.$('message');
var pending = queue.$('pending');

var now = new Date().getTime();
var diff = process.argv[2];
if (!diff) diff = 3600; // default leave 1 hour's worth of records

diff = diff * 1000;
var cutOff = now - diff;

messages.forEachChild(function(dbIndex, messageObj) {
  var timestamp = parseInt(dbIndex.split('-')[0]);
  if (timestamp < cutOff) {
    var token = messageObj.$('token').value;
    if (!pending.$(token).exists) {
      messageObj.delete();
      console.log(dbIndex + ' deleted');
    }
  }

});

db.close();

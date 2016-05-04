var interface = require('cache');
var db = new interface.Cache();
console.log('db: ' + JSON.stringify(db));

// Change these parameters to match your GlobalsDB or Cache system:

var ok = db.open({
  path: '/opt/cache/mgr',
  username: '_SYSTEM',
  password: 'SYS',
  namespace: 'USER'
});


console.log('ok: ' + JSON.stringify(ok));

console.log(db.version());

var node = {
  global: 'rob',
  subscripts: [1],
  data: 'hello'
};

db.set(node);

var result = db.get(node);
console.log(JSON.stringify(result));

db.close();
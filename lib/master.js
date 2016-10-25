/*

 ----------------------------------------------------------------------------
 | ewd-xpress: Express and ewd-qoper8 based application container           |
 |                                                                          |
 | Copyright (c) 2016 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  23 October 2016

   Thanks to:
    Ward De Backer for body-parser enhancement

*/

/*
// Example usage

var params = {
  managementPassword: 'keepThisSecret!',
  serverName: 'New EWD Server',
  port: 8081,
  poolSize: 1
};
var ewdXpress = require('ewd-xpress').master;

// if you want to define REST/web service URL paths with associated routing:

var routes = [
  {
    path: '/testx' // module will default to testx.js
  },
  {
    path: '/patient',
    module: 'my-patient-module'
  }
];

var q = ewdXpress.start(config, routes);

 // if you want to add your own user-defined objects that will be
 //  available in the worker process(es) (in the this.userDefined object):

q.userDefined['myCustomObject'] = { // your object };

*/

var express = require('express');
var bodyParser;
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var sockets = require('./sockets');
var fs = require('fs');
var util = require('util');
var app = express();

var q = new qoper8.masterProcess();
qx.addTo(q);


function start(params, routes) {
  var emptyMap = !params.moduleMap;
  var moduleMap = params.moduleMap || {};
  if (routes) {
    routes.forEach(function(route) {
      var path = route.path;
      if (path.charAt(0) === '/') {
        path = path.substring(1);
      }
      var module = route.module || path;
      moduleMap[path] = module;
      emptyMap = false;
    });
  }
  if (emptyMap) moduleMap = false;

  var config = {
    managementPassword: params.managementPassword || 'keepThisSecret',
    serverName: params.serverName || 'ewd-xpress',
    port: params.port || 8080,
    poolSize: params.poolSize || 1,
    webServerRootPath: params.webServerRootPath || process.cwd() + '/www/',
    no_sockets: params.no_sockets || false,
    qxBuild: qx.build,
    masterProcessPid: process.pid,
    database: params.database,
    errorLogFile: params.errorLogFile || false,
    mode: params.mode || 'production',
    bodyParser: params.bodyParser || false, // allow the user to pass in its own bodyParser
    initialSessionTimeout: params.initialSessionTimeout || 300,
    sessionDocumentName: params.sessionDocumentName || 'CacheTempEWDSession',
    moduleMap: moduleMap,
    lockSession: params.lockSession || false,  // true | {timeout: 60}
    resilientMode: false
  };
  if (params.resilientMode) {
    config.resilientMode = {
      documentName: params.resilientMode.queueDocumentName || 'ewdQueue',
      keepPeriod: params.resilientMode.keepPeriod || 3600
    }
  }
  
  // if user instantiates his/her own bodyParser module, use it
  //  Note: user must then also define the app.use express middleware to use it
  if (config.bodyParser) {
    bodyParser = config.bodyParser;
  }
  else {
    bodyParser = require('body-parser');
    app.use(bodyParser.json());
  }

  app.post('/ajax', function(req, res) {
    console.log('/ajax body: ' + JSON.stringify(req.body));
    qx.handleMessage(req, res);
  });

  console.log('webServerRootPath = ' + config.webServerRootPath);
  app.use('/', express.static(config.webServerRootPath))

  if (routes) {
    routes.forEach(function(route) {
      var path = route.path;
      app.use(path, qx.router());
      console.log('route ' + path + ' will be handled by qx.router');
    });
  }

  q.on('start', function() {
    this.worker.module = 'ewd-xpress.worker';
    //this.worker.loaderFilePath = 'node_modules/ewd-xpress/node_modules/ewd_qoper8-worker.js';
    this.setWorkerPoolSize(config.poolSize);
	
    if (params.database && params.resilientMode) {
      // connect master process to database 
      //  it will use asynch connections to save a copy of
      //  each queued request, and delete them when done
      console.log('starting resilient mode..');
      this.resilientMode = {
        documentName: config.resilientMode.documentName
      };
      var db = params.database;
      var type = db.type;
      if (type === 'cache') db.params.lock = '1';
      if (type === 'cache' || type === 'gtm') {
        console.log('connecting master process to ' + type);
        this.on('dbOpened', function() {
          console.log(this.db.version());
        });
        this.on('dbClosed', function() {
          console.log('Connection to ' + db.type + ' closed');
        });
        require('ewd-qoper8-' + type)(this, db.params);
      }
    }
  });

  q.on('started', function() {
    if (!this.userDefined) this.userDefined = {};
    this.userDefined.config = config;
    var q = this;
    var io;
    var server = app.listen(config.port);
    if (!config.no_sockets) io = require('socket.io')(server);
    // load ewd-xpress socket handling logic
    if (io) sockets(q, io);

    q.on('response', function(messageObj) {
      // handle intermediate messages from worker (which hasn't finished)
      if (messageObj.socketId) {
        var id = messageObj.socketId;
        delete messageObj.socketId;
        delete messageObj.finished;
        io.to(id).emit('ewdjs', messageObj);
      }
    });
  });

  q.start();
  return q;
}

function intercept() {
  return {
    app: app,
    q: q,
    qx: qx
  };
}

module.exports = {
  intercept: intercept,
  start: start
};


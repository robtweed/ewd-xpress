/*

 ----------------------------------------------------------------------------
 | ewd-xpress.js: Express and ewd-qoper8 based application container        |
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

  16 June 2016

*/


var config = {
  managementPassword: 'keepThisSecret!',
  serverName: 'New EWD Server',
  port: 8081,
  poolSize: 1,
  database: {
    type: 'cache',
  }
};

var ewdXpress = require('ewd-xpress').master;
var bodyParser = require('body-parser');
var xp = ewdXpress.intercept();
xp.app.use(bodyParser.text({ type: 'application/graphql' }))
xp.app.use('/graphql-rest', xp.qx.router());

ewdXpress.start(config);

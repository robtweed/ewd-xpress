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

  2 August 2016

*/

module.exports = function(messageObj, application, finished) {
  var fs = require('fs');
  var fragmentName = messageObj.params.file;
  var targetId = messageObj.params.targetId;

  var wsRootPath = this.userDefined.config.webServerRootPath;

  var fragPath = wsRootPath + application + '/' + fragmentName;
  if (messageObj.params.isServiceFragment) {
    fragPath = wsRootPath + 'services/' + fragmentName;
  }

  //console.log('*** ewd-fragment: fragPath = ' + fragPath);

  fs.exists(fragPath, function(exists) {
    if (exists) {
      fs.readFile(fragPath, 'utf8', function(err, data) {
        if (!err) {
          finished({
            fragmentName: fragmentName,
            content: data
          });
        }
      });
    }
    else {
      var message = {
        error: true,
        file: messageObj.params.file
      };
      if (messageObj.params.isServiceFragment) {
        message.isServiceFragment = true;
      }
      finished(message);
    }
  });
};
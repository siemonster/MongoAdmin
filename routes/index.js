var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs');

router.get('/login', function(req, res, next) {

  req.session.destroy(function(err) {

    console.log(req.session);
    res.render('pages/login');
  });
});

router.get('/', function(req, res, next) {

    //res.render('pages/index', {  } );
    res.redirect('/collection/users');
});

router.post('/formatter/userListTable', function(req, res, next) {

        var allUsers = JSON.parse(req.body.allUsers);

        var columnList = [ 'uid', 'originated', 'active', 'admin', 'frames'];
        var modifiedUserList = [];

        _.each(allUsers, function(userObject) {

          var modifiedUser = {};

          _.each(columnList, function(columnName) {

            if(columnName == 'uid') {

              modifiedUser['uid'] = userObject['_id'];
            }
            else if((columnName == 'originated') && ('_originated' in userObject)) {

              if(userObject['_originated'] != undefined)
                modifiedUser['originated'] = new Date( userObject['_originated'] *1000).toGMTString();
              else
                modifiedUser['originated'] = '';
            }
            else if(columnName == 'frames') {

              if(userObject['frames'] != undefined) {

                var summary = '';

                _.each(Object.keys(userObject['frames']), function(frameName) {

                  if(summary.length > 0) {

                    summary += ', ';
                  }

                  summary += frameName;
                });

                modifiedUser['frames'] = summary;
              }
              else {

                modifiedUser['frames'] = '';
              }
            }
            else if(columnName in userObject) {

              modifiedUser[columnName] = userObject[columnName];
            }
            else {

              modifiedUser[columnName] = ' ';
            }
          });

          modifiedUserList.push(modifiedUser);
        });

        res.render('partials/userListTable', { 
          Columns: columnList,
          UserList: modifiedUserList
        } );
});

router.get('/collection/users/', function(req, res, next) {

      var columnList = [ 'uid', 'originated', 'active', 'admin', 'frames' ];

      res.render('pages/userList', { 
        Columns: columnList,
        UserList: []
      } );
});

router.post('/formatter/userViewTable', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.body.selected) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

    res.render('partials/userViewTable', { 
      UserObject: selectedUserObject
    } );
});

router.post('/formatter/userViewTableDashboard', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.body.selected) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

      console.log(selectedUserObject);

    res.render('partials/userViewTableDashboard', { 
      UserObject: selectedUserObject
    } );
});

router.post('/formatter/change/:uid/:frameName', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

    if(req.body.NewValue != undefined) {

      selectedUserObject.frames[req.params.frameName] = req.body.NewValue;
    }
    else {

      var newObject = JSON.parse(req.body.NewObject);
      selectedUserObject.frames[req.params.frameName] = newObject;
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/delete/:uid/:frameName', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

    if(selectedUserObject.frames[req.params.frameName] != undefined) {

      delete selectedUserObject.frames[req.params.frameName];
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/initialSetup/:uid/', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};
    var adminUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
      else if(userObject['_id'] == req.body.admin) {

        adminUserObject = userObject;
      }
    });

    selectedUserObject.frames = {};

    selectedUserObject.frames['Event Monitor'] = adminUserObject.frames['Event Monitor'];
    selectedUserObject.frames['Jira'] = adminUserObject.frames['Jira'];
    selectedUserObject.frames['ServiceNow'] = adminUserObject.frames['ServiceNow'];
    selectedUserObject.frames['Slack'] = adminUserObject.frames['Slack'];

    var dashboardObject = {};
    dashboardObject['sub_links'] = [];
    dashboardObject['url'] = process.env.DEFAULT_DASHBOARD_URL
    selectedUserObject.frames['Dashboards'] = dashboardObject;

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/changeDashUrl/:uid/', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    selectedUserObject.frames.Dashboards.url = req.body.Url;

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/setAdmin/:uid/', function(req, res, next) {

  console.log(req.body.admin);
    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if((req.body.admin == 'true') || (req.body.admin == true)){
      
      selectedUserObject.admin = true
    }
    else {

      selectedUserObject.admin = false;
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/setActive/:uid/', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if((req.body.active == 'true') || (req.body.active == true)){
      
      selectedUserObject.active = true
    }
    else {

      selectedUserObject.active = false;
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/change/:uid/Dashboards/:subLink', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

    var allSublinks = selectedUserObject.frames.Dashboards.sub_links;
    var subLinkFound = false;

    for(let i = 0; i < selectedUserObject.frames.Dashboards.sub_links.length; i++) {

      var subLink = selectedUserObject.frames.Dashboards.sub_links[i];

      if(subLink.title == req.params.subLink) {

        subLinkFound = true;

        selectedUserObject.frames.Dashboards.sub_links[i].url = req.body.NewValue;
      }
    }

    if(subLinkFound == false) {

      selectedUserObject.frames.Dashboards.sub_links.push({ title: req.params.subLink, url: req.body.NewValue});
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.post('/formatter/delete/:uid/Dashboards/:subLink', function(req, res, next) {

    var allUsers = JSON.parse(req.body.allUsers);
    var selectedUserObject = {};

    _.each(allUsers, function(userObject) {

      if(userObject['_id'] == req.params.uid) {

        selectedUserObject = userObject;
      }
    });

    if(selectedUserObject.frames == undefined)
      selectedUserObject.frames = {};

    if(selectedUserObject.frames.Dashboards == undefined)
      selectedUserObject.frames.Dashboards = { url: process.env.DEFAULT_DASHBOARD_URL, sub_links: [] };

    var allSublinks = selectedUserObject.frames.Dashboards.sub_links;

    for(let i = 0; i < selectedUserObject.frames.Dashboards.sub_links.length; i++) {

      var subLink = selectedUserObject.frames.Dashboards.sub_links[i];

      if(subLink.title == req.params.subLink) {

        selectedUserObject.frames.Dashboards.sub_links.splice(i, 1);
      }
    }

    res.send(JSON.stringify(selectedUserObject));
});

router.get('/collection/users/:uid', function(req, res, next) {

          res.render('pages/userView', { 
            UserObject: { "_id": req.params.uid }
          } );
});

module.exports = router;


// Generated by CoffeeScript 1.9.3
(function() {
  var app, bodyParser, clear, connman, error, express, hotspot, manager, networkManager, retry, run, ssids, systemd, wifiScan;

  express = require('express');

  bodyParser = require('body-parser');

  connman = require('./connman');

  hotspot = require('./hotspot');

  networkManager = require('./networkManager');

  systemd = require('./systemd');

  wifiScan = require('./wifi-scan');

  app = express();

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(express["static"](__dirname + '/public'));

  ssids = [];

  error = function(e) {
    console.log(e);
    if (retry) {
      console.log('Retrying');
      console.log('Clearing credentials');
      return manager.clearCredentials().then(run)["catch"](error);
    } else {
      console.log('Not retrying');
      console.log('Exiting');
      return process.exit();
    }
  };

  app.get('/ssids', function(req, res) {
    return res.json(ssids);
  });

  app.post('/connect', function(req, res) {
    if (!((req.body.ssid != null) && (req.body.passphrase != null))) {
      return res.sendStatus(400);
    }
    res.send('OK');
    return hotspot.stop(manager).then(function() {
      return manager.setCredentials(req.body.ssid, req.body.passphrase);
    }).then(run)["catch"](error);
  });

  app.use(function(req, res) {
    return res.redirect('/');
  });

  run = function() {
    return manager.isSetup().then(function(setup) {
      if (setup) {
        console.log('Credentials found');
        return hotspot.stop(manager).then(function() {
          console.log('Connecting');
          return manager.connect(15000);
        }).then(function() {
          console.log('Connected');
          console.log('Exiting');
          return process.exit();
        })["catch"](error);
      } else {
        console.log('Credentials not found');
        return hotspot.stop(manager).then(function() {
          return wifiScan.scanAsync();
        }).then(function(results) {
          ssids = results;
          return hotspot.start(manager);
        })["catch"](error);
      }
    });
  };

  app.listen(80);

  retry = true;

  clear = true;

  manager = null;

  if (process.argv[2] === '--clear=true') {
    console.log('Clear enabled');
    clear = true;
  } else if (process.argv[2] === '--clear=false') {
    console.log('Clear disabled');
    clear = false;
  } else if (process.argv[2] == null) {
    console.log('No clear flag passed');
    console.log('Clear enabled');
  } else {
    console.log('Invalid clear flag passed');
    console.log('Exiting');
    process.exit();
  }

  systemd.exists('NetworkManager.service').then(function(result) {
    if (result) {
      console.log('Using NetworkManager.service');
      return manager = networkManager;
    } else {
      console.log('Using connman.service');
      return manager = connman;
    }
  }).then(function() {
    if (clear) {
      console.log('Clearing credentials');
      return manager.clearCredentials();
    }
  }).then(function() {
    return manager.isSetup().then(function(setup) {
      if (setup) {
        return retry = false;
      }
    });
  }).then(run)["catch"](function(e) {
    console.log(e);
    console.log('Exiting');
    return process.exit();
  });

}).call(this);
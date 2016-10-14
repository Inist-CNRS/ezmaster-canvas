'use strict';

/* Dependencies */
const child_process = require('child_process'),
  fs = require('fs'),
  path = require('path'),
  nunjucks = require('nunjucks'),
  express = require('express'),
  bodyParser = require('body-parser'),
  kuler = require('kuler');

/* Server */
var app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server);

/* Constants */
// EzMaster config file
var EZMASTER_CONFIG = require('/etc/ezmaster.json'),
  CONFIG = {
    name: "MyApp"
  };

// If there is a configPath, we load it
if (EZMASTER_CONFIG.configPath) CONFIG = require(EZMASTER_CONFIG.configPath);

// Directories
const DIRECTORIES = {
  'INPUT': path.resolve(__dirname, EZMASTER_CONFIG.dataPath),
  'OUTPUT': path.resolve(__dirname, EZMASTER_CONFIG.outputPath),
  'PROGRAM': path.resolve(__dirname, '../', EZMASTER_CONFIG.program.directory)
};

/* Variables */
var program = { // Program infos, statements and child_process will be there
    running: false,
    cmd: 'ls',
    opts: ['-alF'],
    messages: []
  },
  // List of all app clients
  clients = {};

program.cmd = EZMASTER_CONFIG.program.cmd ||  program.cmd;
program.opts = EZMASTER_CONFIG.program.opts ||  program.opts;

// App use Nunjucks template engine
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// App can parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Give public access for in/out directories
app.use('/input', express.static(DIRECTORIES.INPUT, {
  dotfiles: 'allow'
}));
app.use('/output', express.static(DIRECTORIES.OUTPUT, {
  dotfiles: 'allow'
}));
app.use(express.static('public'));

// Listening port 3000
server.listen(EZMASTER_CONFIG.httpPort, function() {
  console.log(kuler('Server listening on port : ' + EZMASTER_CONFIG.httpPort, 'green'));
});

io.on('connection', function(socket) {

  // Refresh file list of input directory
  fs.readdir(DIRECTORIES.INPUT, function(err, files) {
    io.emit('updateView', {
      directory: 'input',
      files: getFiles(DIRECTORIES.INPUT, files)
    });
  });
  // Refresh file list of output directory
  fs.readdir(DIRECTORIES.OUTPUT, function(err, files) {
    io.emit('updateView', {
      directory: 'output',
      files: getFiles(DIRECTORIES.OUTPUT, files)
    });
  });

  // Disconnect handler
  socket.on('disconnect', function() {
    console.log(kuler('Client disconnected', 'green'));
  });

  // Start Process
  socket.on('program', function() {
    if (program.child_process) {
      program.child_process.kill();
      delete program.child_process;
      program.messages = [];
      program.running = false;
      // Update button action
      io.emit('updateButton', program.running);
    } else {
      program.child_process = child_process.spawn(program.cmd, program.opts, {
        cwd: DIRECTORIES.PROGRAM
      });
      program.running = true;
      // Update button action
      io.emit('updateButton', program.running);
      /* -------------------- Event Handlers ---------- */
      // Send stdout to GUI
      program.child_process.stdout.on('data', function(data) {
        var messages = [{
          color: 'lightgreen',
          text: data.toString()
        }];
        io.emit('messages', messages);
        program.messages.push(messages[0]);
      });
      // Send stderr to GUI
      program.child_process.stderr.on('data', function(data) {
        var messages = [{
          color: 'orange',
          text: data.toString()
        }];
        io.emit('messages', messages);
        program.messages.push(messages[0]);
      });
      // Send shell errors to GUI
      program.child_process.on('error', function(data) {
        var messages = [{
          color: 'red',
          text: data.toString()
        }];
        io.emit('messages', messages);
        program.messages.push(messages[0]);
        program.running = false;
        // Update button action
        io.emit('updateButton', program.running);
      });
      // Refresh view of output directory
      program.child_process.on('close', function(code) {
        delete program.child_process;
        program.running = false;
        // Update button action
        io.emit('updateButton', program.running);
        var messages = [{
          color: 'gold',
          text: 'Process stopped with code ' + code
        }];
        io.emit('messages', messages);
        program.messages.push(messages[0]);
        fs.readdir(DIRECTORIES.OUTPUT, function(err, files) {
          if (err) throw new Error(kuler(err, 'red'));
          io.emit('updateView', {
            directory: 'output',
            files: getFiles(DIRECTORIES.OUTPUT, files)
          });
        });
      });
    }
  });
});

// Homepage
app.get('/', function(req, res) {
  let view = {};
  //Send data to view
  view.status = program.running;
  view.name = CONFIG.name;
  res.render('index.html', view);
});

/**
 * Get files infos (without hidden)
 * @param {Array} files List of files => [name, name, ...]
 * @return {Array} List of files with more infos (like name & full path) => [{name, path}, ...]
 */
function getFiles(fullpath, files) {
  var result = [];
  for (var i = 0; i < files.length; i++) {
    if (files[i][0] !== '.') {
      result.push({
        name: files[i],
        path: path.join(fullpath.OUTPUT, files[i])
      })
    }
  }
  return result;
}
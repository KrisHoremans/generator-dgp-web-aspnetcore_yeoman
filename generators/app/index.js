'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var del = require('del');
var nd = require('node-dir');
var Guid = require('guid');
var updateNotifier = require('update-notifier');
var pkg = require('./../../package.json');

module.exports = yeoman.generators.Base.extend({
  
  prompting: function () {
    var done = this.async();

    // greet the user
    this.log(yosay('Welcome to the fantastic Yeoman ' + chalk.green('dgp-web-aspnetcore') + ' ' + chalk.blue('(' + pkg.version + ')') + ' generator!'));

    var notifier = updateNotifier({
        pkg,
        updateCheckInterval: 1000 * 60 * 5      // check every 5 minutes. 
    });
    notifier.notify();
    if (notifier.update != undefined) return;
    
    // ask project parameters
    var prompts = [{
      type: 'input',
      name: 'deleteContent',
      message: 'Delete the contents of this directory before generation (.git will be preserved) ? (y/n):',
      default: 'y'
    },
    {
      type: 'input',
      name: 'projectName',
      message: "Enter the name of the new project (don't forget the Pascal-casing):"
    }, 
    {
      type: 'input',
      name: 'kestrelHttpPort',
      message: 'Enter the HTTP port for the kestrel server:'
    },
    {
      type: 'input',
      name: 'iisHttpPort',
      message: 'Enter the HTTP port for the IIS Express server:'
    },
    {
      type: 'input',
      name: 'iisHttpsPort',
      message: 'Enter the HTTPS port for the IIS Express server:'
    }];

    this.prompt(prompts, function (props) {
      this.props = props;     // To access props later use this.props.someOption;
      done();
    }.bind(this));
  },

  writing: function () {
  
    // empty target directory
    console.log('Emptying target directory...');
    if ( this.props.deleteContent == 'y' ) {
        del.sync(['**/*', '!.git', '!.git/**/*'], { force: true, dot: true });
    }
    
    var projectName = this.props.projectName;
    var lowerProjectName = projectName.toLowerCase(); 
    
    var solutionItemsGuid = Guid.create();
    var srcGuid = Guid.create();
    var testGuid = Guid.create();
    var starterKitGuid = Guid.create();
    var integrationGuid = Guid.create();
    var unitGuid = Guid.create();
    
    var kestrelHttpPort = this.props.kestrelHttpPort;
    var iisHttpPort = this.props.iisHttpPort;
    var iisHttpsPort = this.props.iisHttpsPort;
    
    var copyOptions = { 
      process: function(contents) {
        var str = contents.toString();
        var result = str.replace(/StarterKit/g, projectName)
                        .replace(/starterkit/g, lowerProjectName)
                        .replace(/C3E0690A-0044-402C-90D2-2DC0FF14980F/g, solutionItemsGuid.value.toUpperCase())
                        .replace(/05A3A5CE-4659-4E00-A4BB-4129AEBEE7D0/g, srcGuid.value.toUpperCase())
                        .replace(/079636FA-0D93-4251-921A-013355153BF5/g, testGuid.value.toUpperCase())
                        .replace(/BD79C050-331F-4733-87DE-F650976253B5/g, starterKitGuid.value.toUpperCase())
                        .replace(/948E75FD-C478-4001-AFBE-4D87181E1BEC/g, integrationGuid.value.toUpperCase())
                        .replace(/0A3016FD-A06C-4AA1-A843-DEA6A2F01696/g, unitGuid.value.toUpperCase())
                        .replace(/http:\/\/localhost:51002/g, "http://localhost:" + kestrelHttpPort)
                        .replace(/http:\/\/localhost:51001/g, "http://localhost:" + iisHttpPort)
                        .replace(/"sslPort": 44300/g, "\"sslPort\": " + iisHttpsPort);
        return result;
      }
    };
     
     var source = this.sourceRoot();
     var dest = this.destinationRoot();
     var fs = this.fs;
     
     // copy files and rename starterkit to projectName
    
     console.log('Creation project skeleton...');
     
     nd.files(source, function (err, files) {
      for ( var i = 0; i < files.length; i++ ) {
        var filename = files[i].replace(/StarterKit/g, projectName)
                               .replace(/starterkit/g, lowerProjectName)
                               .replace(".npmignore", ".gitignore")
                               .replace(source, dest);
        //console.log(files[i] + ' --> ' + filename);
        fs.copy(files[i], filename, copyOptions);
      }
    });
  },

  install: function () {
    // this.installDependencies();
  }
});

var through = require('through2'),
    path    = require('path'),
    fs      = require('fs'),
    gutil   = require('gulp-util');

function getMultiPkg(pkgDir){
  output = {};

  var pkgFiles = fs.readdirSync(pkgDir);

  pkgFiles.forEach(function (pkgFile) {
    var cnt = fs.readFileSync(pkgDir + pkgFile + '/package.json', 'utf-8');
    var pkg = JSON.parse(cnt);
    output = Object.assign(output, pkg.dependencies);
  });

  return output;
}

/**
 * 入口函数
 * @param  {[type]} options  [description]
 * @param  {[type]} settings [description]
 * @return {[type]}          [description]
 */
module.exports = function(options, settings) {
  options = options || {};
  settings = settings || {};

  var pkgDir = options.dir;
  var cfgFile = options.cfgFile;

  return through.obj(function (file, enc, cb) {
    //判断配置文件
    if(!cfgFile || !fs.existsSync(cfgFile)) {
      this.emit('error', new gutil.PluginError('gulp-package-merge', '配置文件没有设置'));
      return cb();
    }

    //读取配置文件
    var cfgCnt = fs.readFileSync(cfgFile, 'utf-8');
    var cfgPkg = JSON.parse(cfgCnt);

    //读取原来的pkg文件
    var oldpkgCnt = file.contents.toString();
    var oldPkgObj = JSON.parse(oldpkgCnt);

    //存在pkg的配置，合并pkg功能
    if(pkgDir && fs.existsSync(pkgDir)){
      var output = getMultiPkg(pkgDir);
      oldPkgObj.dependencies = Object.assign(cfgPkg.dependencies, output);
    }
    //没有配置pkgdir,从配置中生成新的pkg
    else {
      oldPkgObj.dependencies = Object.assign(oldPkgObj.dependencies, cfgPkg.dependencies);
    }

    try {
      file.contents = new Buffer(
        JSON.stringify(oldPkgObj, null, 2)
      );
    } catch (err) {
      this.emit('error', new gutil.PluginError('gulp-package-merge', err.toString()));
    }

    this.push(file);
    cb();
  });
};

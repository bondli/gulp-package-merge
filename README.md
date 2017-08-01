# gulp-package-merge

> 将一个大目录下的package.json合并成一个大的package.json


### Usage

```shell
var gulpPackageMerge = require('gulp-package-merge');

return gulp.src(sourcedir)
  .pipe(gulpPackageMerge())
  .pipe(gulp.dest(distDir));

```

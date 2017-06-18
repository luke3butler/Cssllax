const fs = require('fs');
const UglifyJS = require("uglify-js");

const code = fs.readFileSync('./cssllax.js', 'utf8');

const minified = UglifyJS.minify(code);

try {
  fs.writeFileSync('./cssllax.min.js', minified.code);
  console.log("Done!");
} catch (err) {
  console.log(err);
}
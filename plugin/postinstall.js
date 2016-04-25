var hook = require('nativescript-hook')(__dirname);
hook.postinstall();

var fs = require('fs');
var path = require('path');

var tsconfigPath = path.join(hook.findProjectDir(), "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
    var tsconfigJSON = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    tsconfigJSON["compilerOptions"] = tsconfigJSON["compilerOptions"] || {};
    tsconfigJSON["compilerOptions"]["emitDecoratorMetadata"] = true;

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfigJSON, null, 2));
}

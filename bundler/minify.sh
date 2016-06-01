#!/usr/bin/env bash

set -e

SCRIPT="$(dirname $1)/$(basename $1 .js)"

./node_modules/uglifyjs/bin/uglifyjs "$SCRIPT.js" > "$SCRIPT.temp.js"
./node_modules/uglifyjs/bin/uglifyjs "$SCRIPT.temp.js" -b > "$SCRIPT.min.js"
sed -i .bak 's/^ *//' "$SCRIPT.min.js"

rm "$SCRIPT.temp.js"
rm "$SCRIPT.min.js.bak"

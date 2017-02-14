#!/usr/bin/env bash

set -e

SCRIPT="$(dirname $1)/$(basename $1 .js)"

../../uglify-js/bin/uglifyjs "$SCRIPT.js" > "$SCRIPT.temp.js"
../../uglify-js/bin/uglifyjs "$SCRIPT.temp.js" -b > "$SCRIPT.min.js"
sed -i.bak 's/^ *//' "$SCRIPT.min.js"

rm "$SCRIPT.temp.js"
rm "$SCRIPT.min.js.bak"

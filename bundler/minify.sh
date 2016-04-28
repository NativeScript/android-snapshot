#!/usr/bin/env bash

set -e

SCRIPT="$1"

uglifyjs "$SCRIPT" > "$SCRIPT.min.js"
uglifyjs "$SCRIPT.min.js" -b > "$SCRIPT"
sed -i .bak 's/^ *//' "$SCRIPT"

rm "$SCRIPT.min.js"
rm "$SCRIPT.bak"

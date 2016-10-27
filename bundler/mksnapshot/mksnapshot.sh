#!/usr/bin/env bash

set -e

V8_FLAGS="--profile_deserialization"

SCRIPT="$1"
OUTPUT_DIR="$2"

echo "Generating snapshot for \"$SCRIPT\" in \"$OUTPUT_DIR\" ..."

function generate_snapshot {
    local ARCH="$1"
    local V8_ARCH="$2"

    echo "***** Generating $ARCH *****"
    mkdir -p "$OUTPUT_DIR/$ARCH/"
    ./mksnapshot-$V8_ARCH "$SCRIPT" --startup_blob "$OUTPUT_DIR/$ARCH/TNSSnapshot.blob" $V8_FLAGS

    pushd "$OUTPUT_DIR/$ARCH"
    xxd -i "TNSSnapshot.blob" > "TNSSnapshot.c"
    rm "TNSSnapshot.blob"
    popd
}

generate_snapshot "armeabi-v7a" "arm"
generate_snapshot "arm64-v8a" "arm64"
generate_snapshot "x86" "x86"

du -bh $OUTPUT_DIR

echo "Finished generating snapshots."


#!/usr/bin/env bash

set -e

V8_FLAGS="--profile_deserialization"

SCRIPT="$1"
OUTPUT_DIR="$2"

echo "Generating snapshot for \"$SCRIPT\" in \"$OUTPUT_DIR\" ..."

function generate_snapshot {
    local ARCH="$1"
    local V8_ARCH="$2"

    if [ ! -f ./mksnapshot-$V8_ARCH ]; then
        echo "***** Skipping $V8_ARCH. Unable to find mksnapshot tool for $V8_ARCH *****"
        return
    fi

    echo "***** Generating $ARCH *****"
    mkdir -p "$OUTPUT_DIR/blobs/$ARCH/"
    ./mksnapshot-$V8_ARCH "$SCRIPT" --startup_blob "$OUTPUT_DIR/blobs/$ARCH/TNSSnapshot.blob" $V8_FLAGS

    mkdir -p "$OUTPUT_DIR/src/$ARCH/"
    pushd "$OUTPUT_DIR/blobs/$ARCH"
    xxd -i "TNSSnapshot.blob" > "../../src/$ARCH/TNSSnapshot.c"
    popd
}

generate_snapshot "armeabi-v7a" "arm"
generate_snapshot "arm64-v8a" "arm64"
generate_snapshot "x86" "x86"

echo "Finished generating snapshots."


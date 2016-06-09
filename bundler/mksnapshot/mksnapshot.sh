#!/usr/bin/env bash

set -e

V8_FLAGS="--profile_deserialization"

SCRIPT="$1"
OUTPUT_DIR="$2"

echo "Generating snapshot for \"$SCRIPT\" in \"$OUTPUT_DIR\" ..."

echo "***** Generating ARM *****"
mkdir -p "$OUTPUT_DIR/armeabi-v7a/"
./mksnapshot-arm "$SCRIPT" --startup_blob "$OUTPUT_DIR/armeabi-v7a/snapshot.blob" $V8_FLAGS

echo "***** Generating ARM64 *****"
mkdir -p "$OUTPUT_DIR/arm64-v8a/"
./mksnapshot-arm64 "$SCRIPT" --startup_blob "$OUTPUT_DIR/arm64-v8a/snapshot.blob" $V8_FLAGS

echo "***** Generating x86 *****"
mkdir -p "$OUTPUT_DIR/x86/"
./mksnapshot-x86 "$SCRIPT" --startup_blob "$OUTPUT_DIR/x86/snapshot.blob" $V8_FLAGS

du -bh $OUTPUT_DIR

echo "Finished generating snapshots."

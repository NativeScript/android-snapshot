#!/usr/bin/env bash

set -e

V8_FLAGS="--profile_deserialization"

echo "Generating snapshot for \"$1\" in \"$2\" ..."

echo "***** Generating ARM *****"
mkdir -p "$2/armeabi-v7a/"
./mksnapshot-arm "$1" --startup_blob "$2/armeabi-v7a/snapshot.android.blob" $V8_FLAGS

echo "***** Generating ARM64 *****"
mkdir -p "$2/arm64-v8a/"
./mksnapshot-arm64 "$1" --startup_blob "$2/arm64-v8a/snapshot.android.blob" $V8_FLAGS

echo "***** Generating x86 *****"
mkdir -p "$2/x86/"
./mksnapshot-x86 "$1" --startup_blob "$2/x86/snapshot.android.blob" $V8_FLAGS

echo "Finished generating snapshots."

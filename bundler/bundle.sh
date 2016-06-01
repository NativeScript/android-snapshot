#!/usr/bin/env bash

set -e

BASE_DIR="$(pwd)"
BUILD_DIR="$BASE_DIR/build"
DIST_DIR="$BASE_DIR/dist"

function mksnapshot {
    cd "$BASE_DIR/mksnapshot/node-v4.7.80-linux-x64"
    "../mksnapshot.sh" "$1" "$2"
}

mkdir -p "$BUILD_DIR"

echo "Creating tns-core-modules snapshot ..."
tns create SkeletonCoreApp --path "$BUILD_DIR"
tns prepare android --path "$BUILD_DIR/SkeletonCoreApp"

python create_bundle.py "$BUILD_DIR/SkeletonCoreApp/platforms/android/src/main/assets/app/tns_modules/"

mkdir -p "$DIST_DIR/tns-core-modules-snapshot" && pushd "$_"
cp "$BUILD_DIR/bundler/bundle.min.js" "_embedded_script_.android.js"
mksnapshot "$(pwd)/_embedded_script_.android.js" "$(pwd)/snapshot"
popd

echo "Creating nativescript-angular snapshot ..."
tns create SkeletonAngularApp --ng --path "$BUILD_DIR"
tns prepare android --path "$BUILD_DIR/SkeletonAngularApp"

python create_bundle.py "$BUILD_DIR/SkeletonAngularApp/platforms/android/src/main/assets/app/tns_modules/" --ng

mkdir -p "$DIST_DIR/nativescript-angular-snapshot" && pushd "$_"
cp "$BUILD_DIR/bundler/bundle.min.js" "_embedded_script_.android.js"
mksnapshot "$(pwd)/_embedded_script_.android.js" "$(pwd)/snapshot"
popd
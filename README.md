## Installing

To start using the package execute:
```shell
tns install android-snapshot
```

This will install the [`nativescript-dev-android-snapshot`](https://www.npmjs.com/package/nativescript-dev-android-snapshot) package and save it as a dev dependency.

## Activating

The plugin's hooks will be activated by default **only in release** configuration.

Optionally, this behavior can also be controlled by the `TNS_ANDROID_SNAPSHOT` environment variable:
* Set it to `0` to temporarily disable snapshots in release configuration.
* Set it to `1` to enable snapshots in even debug configuration.

## Usage

When the `android-snapshot` plugin is activated, it performs the following steps in its after-prepare hook:
1. If snapshot generation is disabled - exit.
2. Checks whether the application is using Angular or not and depending on that bundles with webpack either the [tns-core-modules](https://github.com/NativeScript/NativeScript) package or both [tns-core-module](https://github.com/NativeScript/NativeScript) and [nativescript-angular](https://github.com/NativeScript/nativescript-angular) packages. The plugin uses Webpack v1.12.14.
3. Removes the files included in the bundle (listed in `bundle.records.json` produced by Webpack) from the prepared folder and replaces them with the bundle produced by Webpack.
4. Uses [mksnapshot tool] to generate [snapshot](https://v8project.blogspot.bg/2015/09/custom-startup-snapshots.html) of the bundled file in the form of a `.blob` file and C header file containing a static array definition filled with the `.blob` file contents.
5. If `snapshotOptions.useLibs` is set to `true` the plugin will produce dynamic library (`.so` file) from the C header file and include it in the `.apk`, Otherwise - the `.blob` files will be added in the `.apk` and loaded at runtime. Produce dynamic library requires to have android ndk locally on the developer's machine.

On startup the Android Runtime will load the correct `snapshot.blob`/`libsnapshot.so` file. This will allow all further `require(module)` calls to be resolved from the modules cache contained within the snapshot binary.

## Uninstalling

To remove the `android-snapshot` package execute:
```shell
npm uninstall nativescript-dev-android-snapshot --save-dev
```

## Troubleshooting

After plugin removal or between configuration changes it is possible that the CLI will fail to prepare some plugins. This can be resolved by removing and then adding the `android` platform.

For more information or reporting issues follow this repository: https://github.com/NativeScript/android-snapshot

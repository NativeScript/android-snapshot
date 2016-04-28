A proof of concept plugin of [{N} Angular](https://github.com/NativeScript/nativescript-angular) utilizing [V8 heap snapshots](http://v8project.blogspot.bg/2015/09/custom-startup-snapshots.html) for reduced startup time.

For more information follow the related issue: [NativeScript#1563](https://github.com/NativeScript/NativeScript/issues/1563).

## Results
Tested on a Nexus 5 device:

| Run                   | Startup time |
| --------------------- | -----------: |
| Non-bundled           |       4000ms |
| Bundled               |       3600ms |
| Bundled with snapshot |       2100ms |

## Requirements
* NativeScript CLI 2.0
* NativeScript Runtime for Android 2.0

## Getting Started
```shell
$ tns create app-demo --template ./template
$ cd app-demo
$ tns plugin add ../plugin
$ tns run android
```

## Limitations
* APK file size will be increased with 6MB.
* The installed application size will be increased with an additional 24MB (5MB in the future).
* It is not possible to step into the embedded script from VS Code. You must use the CLI if you want to debug it.

A proof of concept plugin of [Core NativeScript](https://github.com/NativeScript/NativeScript) / [NativeScript+Angular](https://github.com/NativeScript/nativescript-angular) utilizing [V8 heap snapshots](http://v8project.blogspot.bg/2015/09/custom-startup-snapshots.html) for reduced startup time.

For more information follow the related issue: [NativeScript#1563](https://github.com/NativeScript/NativeScript/issues/1563).

## Results
Startup time tested on a Nexus 5 device:

| Configuration             | Core NativeScript | NativeScript+Angular |
| ------------------------- | ----------------: | ---------------------: |
| Non-bundled               |            2350ms |                 4000ms |
| Bundled                   |            2100ms |                 3600ms |
| Bundled with snapshot     |            1600ms |                 2100ms |

## Requirements
* NativeScript CLI 2.0
* NativeScript Runtime for Android 2.0

## Limitations
* APK file size will be increased with 1.5MB (6MB with Angular).
* The installed application size will be increased with an additional 1.2MB (5MB with Angular).
* It is not possible to step into the embedded script from VS Code. You must use the CLI if you want to debug it.

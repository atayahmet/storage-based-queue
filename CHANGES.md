# Release Notes:

## Changes for v1.0.0:

* Async support added to many processes.
* All test cases has been re-writen for async calls.
* Localforage library added to dependencies for will support the three type (localstorage, indexeddb, websql) storages.
* In memory database adapter added.
* Channel logic moved to Channel class from queue class.
* Worker registration way has been changed slightly.
* Worker dependencies management moved to another method.
* Plugin infrastructure added. After which different storage modules can be used (AsyncStorage (React Native) supported from now).
* ESLint integrated.
* Network activities check removed. This control left to developer because there is different development environments (Browser, React Native etc.).
* Added new `merge()` method to container class for some configuration objects to be merge.
* debug npm package removed from dependencies.

## Changes for v1.0.1:

* Container class removed from channel class and the workers were taken directly from the Queue class.
* Emojis replaced with ascii characters in console.
* Console outputs improved.

## Changes for v1.0.2:

* Removed old tests

## Changes for v1.1.1:

* Some unused declarations has been deleted [(#80e26ee)](https://github.com/atayahmet/storage-based-queue/commit/80e26ee)
* Flowtype interfaces folder moved to src folder. [(#e1630c8)](https://github.com/atayahmet/storage-based-queue/commit/e1630c8)
* InMemory adapter default storage was made.
* Removed LocalForage library from dependencies. Just supported the `localstorage` and `inmemory` storage. [(#5694a6e)](https://github.com/atayahmet/storage-based-queue/commit/5694a6e)
* Status method added to channel class for check if channel working. [(#38f4e92)](https://github.com/atayahmet/storage-based-queue/commit/38f4e92)

## Changes for v1.2.0:

* Added native browser worker support. (with polyfill) [(#bce43fa)](https://github.com/atayahmet/storage-based-queue/commit/bce43fa)

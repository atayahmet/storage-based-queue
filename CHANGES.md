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

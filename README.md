[![npm version](https://badge.fury.io/js/storage-based-queue.svg)](https://badge.fury.io/js/storage-based-queue)
[![Build Status](https://travis-ci.org/atayahmet/storage-based-queue.svg?branch=v0.0.5-beta5)](https://travis-ci.org/atayahmet/storage-based-queue)
[![Coverage Status](https://coveralls.io/repos/github/atayahmet/storage-based-queue/badge.svg?branch=master)](https://coveralls.io/github/atayahmet/storage-based-queue?branch=master)
[![Dependency Status](https://img.shields.io/david/atayahmet/storage-based-queue.svg?style=flat-square)](https://david-dm.org/atayahmet/storage-based-queue)
[![devDependencies Status](https://david-dm.org/atayahmet/storage-based-queue/dev-status.svg)](https://david-dm.org/atayahmet/storage-based-queue?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/atayahmet/storage-based-queue/badge.svg)](https://snyk.io/test/github/atayahmet/storage-based-queue)
[![GitHub license](https://img.shields.io/github/license/atayahmet/storage-based-queue.svg)](https://github.com/atayahmet/storage-based-queue/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/atayahmet/storage-based-queue.svg)](https://github.com/atayahmet/storage-based-queue/issues)

# Persistent Queue For Browsers

## Introduction

Storage based queue processing mechanism. Today, many backend technology is a simple derivative of the queuing systems used in the browser environment.

You can run jobs over the channels as asynchronous that saved regularly.

This library just a solution method for some use cases. Today, there are different technologies that fulfill the similar process.

**Reminders:**

* Designed for only browser environments.
* Built-in error handling.
* ES6/ES7 features.
* Full control over the workers.
* React Native support. (require few minor config)
* Native browser worker. (with polyfill)

## How it works?

Data regularly store (localstorage, indexeddb, websql, inmemory or custom storage drivers) added to queue pool. Storing queue data is also inspired by the [JSON-RPC](http://www.jsonrpc.org/) method. When the queue is started, the queues start to be processed sequentially in the specified range according to the sorting algorithm.

If any exceptions occur while the worker classes are processing, the current queue is reprocessed to try again. The task is frozen when it reaches the defined retry value.

### Channels

You need to create at least one channel. One channel can be created as many channels as desired. Channels run independently of each other. The areas where each channel will store tasks are also separate. The area where tasks are stored is named with the channel name and prefix.

The important thing to remember here is that each newly created channel is actually a new copy of the Queue class. So a new instance is formed, but the dependencies of the channels are still alive as singletons.

Example; You created two channels. Their names are channelA and channelB. If you make a setting in the channelA instance, this change will also be reflected in channelB and all other channels.

### Workers

You can create countless worker. Worker classes should return `boolean` `(true / false)` data with the Promise class as the return value. The return `Promise / resolve (true)` must be true if a task is successfully **completed** and you want to pass the next task. A possible exception should also be **tried** again: `Promise / resolve (false)`. If we do not want the task to be retried and we want to pass the next task: `Promise / reject ('any value')`

Also you can use native [browser worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker). If you are browser does not support Worker, Browser Worker polyfil will add a [pseudo-worker](https://github.com/nolanlawson/pseudo-worker) function to window object.

Plase check the docs: [Workers](https://github.com/atayahmet/storage-based-queue/wiki/Workers)

## Installation

```sh
$ npm install storage-based-queue --save
```

**import:**

```javascript
import Queue from "storage-based-queue";
```

**Script Tag:**

```javascript
<script src="https://unpkg.com/storage-based-queue@1.2.2/dist/queue.min.js" />
```

## Basic Usage

**Worker class:**

```javascript
class MessageSenderWorker {
  handle(message) {
    // If return value is false, this task will retry until retry value 5.
    // If retry value is 5 in worker, current task will be as failed and freezed in the task pool.
    retry = 5;

    // Should return true or false value (boolean) that end of the all process
    // If process rejected, current task will be removed from task pool in worker.
    return new Promise((resolve, reject) => {
      // A function is called in this example.
      // The async operation is started by resolving the promise class with the return value.
      const result = someMessageSenderFunc(message);
      if (result) {
        // Task will be completed successfully
        resolve(true);
      } else {
        // Task will be failed.
        // If retry value i not equal to 5,
        // If the retry value was not 5, it is being sent back to the pool to try again.
        resolve(false);
      }
    });
  }
}
```

**Register worker:**

```javascript
Queue.workers({ MessageSenderWorker });
```

**Create channel:**

```javascript
// create new queue instance with default config
const queue = new Queue();
```

```javascript
// create a new channel
const channel = queue.create("send-message");
```

**Add task to channel:**

```javascript
channel
  .add({
    label: "Send message",
    handler: "SendMessageWorker",
    args: "Hello world!",
  })
  .then(result => {
    // do something...
  });
```

**Start queue:**

```javascript
channel.start();
```

That's it!

## Documentaion

[Click for detailed documentation](https://github.com/atayahmet/storage-based-queue/wiki/Quick-Start)

## Tests

```ssh
$ npm test
```

## Browser Support

| Name    | Version |
| ------- | :------ |
| Chrome  | 32 +    |
| Firefox | 29 +    |
| Safari  | 8 +     |
| Opera   | 19 +    |
| IE      | 11      |
| Edge    | all     |

> **Note:** Listed above list by pormise support.

You can testing all others browser version at <a href="https://www.browserstack.com" target="_blank">BrowserStack</a>

<a href="https://www.browserstack.com" target="_blank"><img alt="BrowserStack" src="https://raw.github.com/josdejong/mathjs/master/misc/browserstack.png"></a>

## Change log

[See CHANGELOG.md](https://github.com/atayahmet/storage-based-queue/blob/master/CHANGES.md)

## License

MIT license

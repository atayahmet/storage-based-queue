[![npm version](https://badge.fury.io/js/storage-based-queue.svg)](https://badge.fury.io/js/storage-based-queue)
[![Build Status](https://travis-ci.org/atayahmet/storage-based-queue.svg?branch=v0.0.5-beta5)](https://travis-ci.org/atayahmet/storage-based-queue)
[![Coverage Status](https://coveralls.io/repos/github/atayahmet/storage-based-queue/badge.svg?branch=master)](https://coveralls.io/github/atayahmet/storage-based-queue?branch=master)
[![Dependency Status](https://img.shields.io/david/atayahmet/storage-based-queue.svg?style=flat-square)](https://david-dm.org/atayahmet/storage-based-queue)
[![devDependencies Status](https://david-dm.org/atayahmet/storage-based-queue/dev-status.svg)](https://david-dm.org/atayahmet/storage-based-queue?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/atayahmet/storage-based-queue/badge.svg)](https://snyk.io/test/github/atayahmet/storage-based-queue)
[![GitHub license](https://img.shields.io/github/license/atayahmet/storage-based-queue.svg)](https://github.com/atayahmet/storage-based-queue/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/atayahmet/storage-based-queue.svg)](https://github.com/atayahmet/storage-based-queue/issues)

# Persistent Queue For The Browsers

## Introduction

Storage based queue processing mechanism. Today, many backend technology is a simple derivative of the queuing systems used in the browser environment.

You can run jobs over the channels as asynchronous that saved regularly.

This library just a solution method for some use cases. Today, there are different technologies that fulfill the similar process.

## How it works?

Data regularly store (localstorage, indexeddb, websql, inmemory or custom storage drivers) added to queue pool. Storing queue data is also inspired by the [JSON-RPC](http://www.jsonrpc.org/) method. When the queue is started, the queues start to be processed sequentially in the specified range according to the sorting algorithm.

If any exceptions occur while the worker classes are processing, the current queue is reprocessed to try again. The task is frozen when it reaches the defined retry value.

### Channels

You need to create at least one channel. One channel can be created as many channels as desired. Channels run independently of each other. The areas where each channel will store tasks are also separate. The area where tasks are stored is named with the channel name and prefix.

The important thing to remember here is that each newly created channel is actually a new copy of the Queue class. So a new instance is formed, but the dependencies of the channels are still alive as singletons.

Example; You created two channels. Their names are channelA and channelB. If you make a setting in the channelA instance, this change will also be reflected in channelB and all other channels.

### Workers

Worker classes should return `boolean` `(true / false)` data with the Promise class as the return value. The return `Promise / resolve (true)` must be true if a task is successfully **completed** and you want to pass the next task. A possible exception should also be **tried** again: `Promise / resolve (false)`. If we do not want the task to be retried and we want to pass the next task: `Promise / reject ('any value')`

## Installation

```sh
$ npm install storage-based-queue --save
```

**import:**

```javascript
import Queue from "storage-based-queue";
```

## Basic Usage

**Worker class:**

```javascript
class SendMessageWorker {
  handle(message) {
    retry = 5;
    return new Promise((resolve, reject) => {
      const result = someMessageSenderFunc(message);
      if (result) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}
```

**Register worker:**

```javascript
Queue.workers({ SendMessageWorker });
```

**Create channel:**

```javascript
const queue = new Queue();
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

## License

MIT license

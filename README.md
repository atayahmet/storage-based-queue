[![Build Status](https://travis-ci.org/atayahmet/storage-based-queue.svg?branch=v0.0.5-beta5)](https://travis-ci.org/atayahmet/storage-based-queue)
[![Dependency Status](https://img.shields.io/david/atayahmet/storage-based-queue.svg?style=flat-square)](https://david-dm.org/atayahmet/storage-based-queue)
[![devDependencies Status](https://david-dm.org/atayahmet/storage-based-queue/dev-status.svg)](https://david-dm.org/atayahmet/storage-based-queue?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/atayahmet/storage-based-queue/badge.svg)](https://snyk.io/test/github/atayahmet/storage-based-queue)


# Storage Based Queue on Browser

Storage based queue processing mechanism. Today, many backend technology is a simple derivative of the queuing systems used in the browser environment.

You can run jobs over the channels as asynchronous that saved regularly.

This library just a solution method for some use cases. Today, there are different technologies that fulfill the similar process.

## How it works?

Data regularly store (local storage for now) added to queue pool. Storing queue data is also inspired by the [JSON-RPC](http://www.jsonrpc.org/) method. When the queue is started, the queues start to be processed sequentially in the specified range according to the sorting algorithm.

If any exceptions occur while the worker classes are processing, the current queue is reprocessed to try again. The task is frozen when it reaches the defined retry value.

Worker classes should return `boolean` `(true / false)` data with the Promise class as the return value. The return `Promise / resolve (true)` must be true if a task is successfully **completed** and you want to pass the next task. A possible exception should also be **tried** again: `Promise / resolve (false)`. If we do not want the task to be retried and we want to pass the next task: `Promise / reject ('any value')`

## Quick Start

### Installation

```sh
$ npm install storage-based-queue --save
```

**import:**

```javascript
import * as Queue from 'storage-based-queue';
```

**import via script tag:**

```html
<script type="text/javascript" src="node_modules/storage-based-queue/dist/queue.js">
```

**Create instance:**

```javascript
new Queue;
```

**Worker class:**

```javascript
class SendEmail {
  retry = 2;

  handle(args) {
    try {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    } catch(e) {
      reject('rejected')
    }
  }
}
```

> **Note:** The return value of the worker classes must be promise.


**Worker Register:**

```javascript
Queue.register([
  { handler: SendEmail }
]);

```

**Create channel and run queue listener:**

```javascript
const queue = new Queue();

const channelA = queue.create('send-email');

channelA.start();
```

Add a job to **channelA** listener:

```javascript
channelA.add({
  handler: 'SendEmail',
  args: {email: 'johndoe@example.com', fullname: 'John Doe'}
});
```

That's it!

The queue will start automatically because we have already started the **start()** method

## Configuration

| Name        | Type           | Description  |
| ------------- |:-------------| :-----|
| prefix      | string | Storage key name prefix for jobs. Default: `sq_jobs`
| timeout      | integer      |   Worker delay time of between two taks. Default: `1000` |
| limit | integer      | Runnable task limit. Default: `-1 (limitless)` |

## Sorting Algorithms

| Name   |  Description  |
| -------|:--------------|
| FIFO   | First In First Out (Default)|
| LIFO   | Last In First Out |

Detail information: [FIFO and LIFO](https://en.wikipedia.org/wiki/FIFO_and_LIFO_accounting)

**Example:**

```javascript
const queue = new Queue({prefix: 'my-Queue', timeout: 1500, limit: 50, principle: Queue.FIFO})
```

Other ways config the queue (runtime):

```javascript
const queue = new Queue;
queue.setTimeout(15000);
queue.setLimit(50);
queue.setPrefix('my-Queue');
queue.setPrinciple(Queue.LIFO);
```

## Advanced Workers

Below the detailed worker class usage.

```javascript
class SendEmail {
  retry = 2;

  handle(args, dep1, dep2) {
    try {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    } catch(e) {
      reject('rejected')
    }
  }
  
  before(args) {
    //
  }
  
  after(args) {
    //
  }
}
```

> **Note:** The worker classes has two events. **before** and **after**

**Register:**
```javascript
const user = new User;
const order = new Order;

Queue.register([
  { handler: SendEmail, deps: { user, order } }
]);

```

## Methods

All methods will explain in this section with examples.


### add()

Create new task and return it's queue id.

| Name        | Type           | Description  |
| ------------- |:-------------| :-----|
| handler      | string | Worker class name.
| args      | string | Worker  parameters.
| priority      | string | Queue priority value. Default: `0`
| tag      | string | Task idenitity tag.


**Example:**


```javascript

queue.add({
  handler: 'SendEmail',
  tag: 'email-sender',
  args: {email: 'johndoe@example.com', fullname: 'John Doe'},
  priority: 2
});

```

### start()

Start the queue listener. If has any tasks waiting the run, starts the process of these tasks.
Next when adding tasks will run automaticly.

**Example:**

```javascript
const queue = new Queue;

queue.start();
```

### stop()

Stop the queue listener after current tasks is done.

```javascript
queue.stop();
```

### forceStop()

Stop the queue listener including current task.

```javascript
queue.forceStop();
```

### create()

Create a new channel.

```javascript
const channelA = qeueu.create('channel-a');

channelA.add({
  handler: 'SendEmail',
  args: {email: 'johndoe@example.com', fullname: 'John Doe'}
});

channelA.start();
```

### isEmpty()

Checks the channel repository has any task.

```javascript
channel.isEmpty()
```

### count()

Get the number of tasks.

```javascript
channel.count();
```

### countByTag()

Get the number of tasks by a specific tag.

```javascript
channel.countByTag('send-email');
```


### clear()

Clear all tasks.

```javascript
channel.clear();
```

### clearByTag()

Clear all tasks by a specific tag.

```javascript
channel.clearByTag('send-email');
```

### has()

Checks a task by queue id.

```javascript
const id = channel.add({
  handler: 'SendEmail',
  args: {email: 'johndoe@example.com', fullname: 'John Doe'}
});
```

```javascript
channel.has(id);
```

### hasByTag()

Checks a task by tag.

```javascript
channel.hasByTag('email-sender');
```

## Documentaion

## License
MIT license

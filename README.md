# Storage Based Queue

Storage based queue processing mechanism. Today, many backend technology is a simple derivative of the queuing systems used in the browser environment.

You can run jobs over the channels as asynchronous that saved regularly.

This library just a solution method for some use cases. Today, there are different technologies that fulfill the similar process.

[![Dependency Status](https://img.shields.io/david/atayahmet/storage-based-queue.svg?style=flat-square)](https://david-dm.org/atayahmet/storage-based-queue)
[![devDependencies Status](https://david-dm.org/atayahmet/storage-based-queue/dev-status.svg)](https://david-dm.org/atayahmet/storage-based-queue?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/atayahmet/storage-based-queue/badge.svg)](https://snyk.io/test/github/atayahmet/storage-based-queue)

## Quick Start

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
| max | integer      | Runnable task limit. Default: `-1 (limitless)` |

**Example:**

```javascript
const queue = new Queue({prefix: 'my-Queue', timeout: 1500, max: 50, principle: Queue.FIFO})
```

Other ways config the queue (runtime):

```javascript
const queue = new Queue;
queue.setTimeout(15000);
queue.setMax(50);
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

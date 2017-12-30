import Queue from './dist/queue';

class SendEmail {
  handle(i, j, k) {
    console.log('[SendEmail]-> handle', i, j, k);
  }

  before() {
    console.log('[SendEmail]-> before');
  }

  after() {
    console.log('[SendEmail]-> after');
  }
}

Queue.register([
  {
    handler: SendEmail,
    deps: [1 ,2, 3]
  }
]);

// class SendEmail {
//     retry = 2;

//     handle(args) {
//       try {
//         return new Promise((resolve, reject) => {
//           resolve(true);
//         });
//       } catch(e) {
//         reject('rejected')
//       }
//     }
//   }

function SendEmail() {

    }

    SendEmail.prototype.retry = 2;
    SendEmail.prototype.handle = function(args) {
      try {
          return new Promise((resolve, reject) => {
            console.log('hellooo', args);
            resolve(true);
          });
        } catch(e) {
          reject('rejected')
        }
    };

    Queue.register([
      {handler: SendEmail}
    ]);

    const queue = new Queue({
      prefix: 'sq_jobsx',
      timeout: 1000,
      limit: 1,
      principle: Queue.FIFO
    });

    queue.setLimit(5);
    queue.setPrefix('hello');

    const channelA = queue.create('mailing');


    setTimeout(() => {
    channelA.add({
      handler: 'SendEmail',
      args: {email: 'johndoe@example.com', fullname: 'John Doe 1'}
    });
    }, 1);

    setTimeout(() => {
    channelA.add({
      handler: 'SendEmail',
      args: {email: 'johndoe@example.com', fullname: 'John Doe 2'}
    });
    },2);

    setTimeout(() => {
    channelA.add({
      handler: 'SendEmail',
      args: {email: 'johndoe@example.com', fullname: 'John Doe 3'}
    });
    }, 3);

    setTimeout(() => {
    channelA.add({
      handler: 'SendEmail',
      args: {email: 'johndoe@example.com', fullname: 'John Doe 4'}
    });
    },4);

    setTimeout(() => {
    channelA.add({
      handler: 'SendEmail',
      args: {email: 'johndoe@example.com', fullname: 'John Doe 5'},
      priority: 10
    });
    }, 5);

    setTimeout(channelA.start.bind(channelA), 1000);
    // const channelB = queue.create('sms');
    // channelB.add({
    //   handler: 'SendEmail',
    //   args: {email: 'johndoe@example.com', fullname: 'John Doe'}
    // });
    // channelB.add({
    //   handler: 'SendEmail',
    //   args: {email: 'johndoe@example.com', fullname: 'John Doe'}
    // });

    // channelB.start();

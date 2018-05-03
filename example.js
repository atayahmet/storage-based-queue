function SendEmail() {}

SendEmail.prototype.retry = 4;
SendEmail.prototype.handle = function (args, p1, p2) {
  try {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  } catch (e) {
    reject('rejected');
  }
};

function deneme() {}
// Queue.use({storage: AsyncStorage})
Queue.workers({ SendEmail });
Queue.deps({ SendEmail: ['hello', 'hello 2', new deneme()] });

const queue = new Queue({
  storage: 'inmemory',
  prefix: 'sq_jobsx',
  timeout: 10,
  limit: 1,
  principle: Queue.FIFO,
  debug: true,
});

queue.setLimit(-1);
// queue.setDebug(true);
queue.setPrefix('hellos');
queue.setTimeout(1001);

const channelA = queue.create('mailing');

channelA.on('email-sender:before', () => {
  // console.log('test-3 beforeeee');
});

channelA.on('email-sender:after', () => {
  // console.log('test-3 after');
});

channelA.on('email-sender:*', () => {
  // console.log('test-3 wildcard');
});

channelA.on('*', () => {
  // console.log('wild card');
});

setTimeout(async () => {
  await channelA.add({
    label: 'Deneme 1',
    priority: 2,
    handler: 'SendEmail',
    tag: 'email-sender',
    args: { email: 'johndoe@example.com', fullname: 'John Doe 1' },
  });
  await channelA.add({
    label: 'Deneme 2',
    handler: 'SendEmail',
    tag: 'email-sender',
    args: { email: 'johndoe@example.com', fullname: 'John Doe 2' },
  });
  // await channelA.add({
  //   label: 'Deneme 1',
  //   handler: 'SendEmail',
  //   tag: 'email-sender',
  //   args: { email: 'johndoe@example.com', fullname: 'John Doe 3' },
  // });
  // await channelA.add({
  //   label: 'Deneme 1',
  //   handler: 'SendEmail',
  //   tag: 'email-sender',
  //   args: { email: 'johndoe@example.com', fullname: 'John Doe 4' },
  // });
  // await channelA.add({
  //   label: 'Deneme 1',
  //   handler: 'SendEmail',
  //   tag: 'email-sender',
  //   args: { email: 'johndoe@example.com', fullname: 'John Doe 5' },
  // });

  await channelA.start();
}, 1000);
// setTimeout(async () => {
// await channelA.add({
//   handler: 'SendEmail',
//   tag: 'email-sender',
//   args: {email: 'johndoe@example.com', fullname: 'John Doe 1'}
// });
// }, 1);

// setTimeout(async () => {
// await channelA.add({
//   handler: 'SendEmail',
//   args: {email: 'johndoe@example.com', fullname: 'John Doe 2'}
// });
// },2);

// setTimeout(async () => {
// await channelA.add({
//   handler: 'SendEmail',
//   args: {email: 'johndoe@example.com', fullname: 'John Doe 3'}
// });
// }, 3);

// setTimeout(async () => {
// await channelA.add({
//   handler: 'SendEmail',
//   args: {email: 'johndoe@example.com', fullname: 'John Doe 4'}
// });
// },4);

// setTimeout(async () => {
// await channelA.add({
//   handler: 'SendEmail',
//   args: {email: 'johndoe@example.com', fullname: 'John Doe 5'},
//   priority: 10
// });
// }, 5);

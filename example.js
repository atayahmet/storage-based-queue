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

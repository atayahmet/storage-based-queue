export default class SendEmail {
  retry = 4;

  handle(args) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  before(args) {
    console.log('before event', args);
  }

  after(args) {
    console.log('after event', args);
  }
}

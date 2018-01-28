export default class SendEmail {
  retry = 4;

  handle(args) {
    try {
      return new Promise((resolve, reject) => {
        resolve(true);
        // reject(false)
      });
    } catch(e) {
      console.log(e);
    }
  }
  before(args) {
    console.log('before event', args);
  }

  after(args) {
    console.log('after event', args);
  }
}

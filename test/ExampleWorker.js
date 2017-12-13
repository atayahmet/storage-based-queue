export default class SendEmail {
  retry = 4;

  handle(args, product, category) {
    try {
      return new Promise((resolve, reject) => {
        resolve(true);
        // reject(false)
      });
    } catch(e) {
      console.log(e);
    }
  }
  before(args: any) {
    console.log('before event', args);
  }

  after(args: any) {
    console.log('after event', args);
  }
}

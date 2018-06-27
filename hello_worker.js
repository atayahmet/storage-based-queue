onmessage = function (e) {
  console.log('Message received from main script', e);
  // var workerResult = "Result: " + e.data[0] * e.data[1];
  // console.log('Posting message back to main script');

  fetch('https://jsonplaceholder.typicode.com/posts').then((result) => {
    result.json().then((data) => {
      // postMessage(JSON.parse(JSON.stringify(result)));
      postMessage(e.data);
    });
  });
};

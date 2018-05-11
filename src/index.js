import 'pseudo-worker/polyfill';
import Queue from './queue';

/* global window:true */

if (typeof window !== 'undefined') {
  window.Queue = Queue;
}

export default Queue;

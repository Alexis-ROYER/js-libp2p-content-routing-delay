/* eslint-disable no-console */
'use strict'

/**
 * @file
 * Inspired from https://github.com/libp2p/js-libp2p/blob/v0.36.2/examples/peer-and-content-routing/2.js.
 */


// Analyze arguments.
function usage() {
  console.log('USAGE: node %s <test option> <delay1> <delay2> <delay3>', require('path').basename(process.argv[1]));
}
// - #1: Test option - 1 or 2
const testOption = parseInt(process.argv[2] || "0");
if ((testOption !== 1) && (testOption !== 2)) {
  usage();
  console.log('');
  console.log('Please choose option 1 or 2:');
  console.log('- Option 1: start and connect node1, node2 and node3 before node1 provides its content');
  console.log('- Option 2: start and connect node3 after node1 has provided its content');
  process.exit(1);
}
// - #2: delay1
const delay1 = parseInt(process.argv[3] || "100");
// - #3: delay2
const delay2 = parseInt(process.argv[4] || "300");
// - #4: delay3
const delay3 = parseInt(process.argv[5] || "100");
console.log('Test conditions:')
console.log('- test option: %s', testOption);
console.log('- delay1: %s ms (\'Wait for onConnect handlers in the DHT\' for node1, node2 and optionally node3)', delay1);
console.log('- delay2: %s ms (\'wait for propagation\')', delay2);
console.log('- delay3: %s ms (\'Wait for onConnect handlers in the DHT\' for node3 when started after node1 has provided its content', delay3);


const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Mplex = require('libp2p-mplex')
const { NOISE } = require('@chainsafe/libp2p-noise')
const { CID } = require('multiformats/cid')
const KadDHT = require('libp2p-kad-dht')

const delay = require('delay')


const createNode = async () => {
  const node = await Libp2p.create({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    modules: {
      transport: [TCP],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      dht: KadDHT
    },
    config: {
      dht: {
        enabled: true
      }
    }
  })

  // await node.start()
  return node
}

;(async () => {
  // Create nodes.
  console.log('Creating nodes:');
  const [node1, node2, node3] = await Promise.all([
    createNode(),
    createNode(),
    createNode(),
  ]);
  console.log('- node1: %s', node1.peerId.toB58String());
  console.log('- node2: %s', node2.peerId.toB58String());
  console.log('- node3: %s', node3.peerId.toB58String());
  const cid = CID.parse('QmTp9VkYvnHyrqKQuFPiuZkiX9gPcqj6x5LJ1rmWuSySnL');

  // Start and connect node1 and node2.
  console.log('Starting node1');
  await node1.start();
  console.log('Starting node2');
  await node2.start();
  console.log('Dialing node2 from node1');
  await node1.peerStore.addressBook.set(node2.peerId, node2.multiaddrs);
  await node1.dial(node2.peerId);

  // Option 1: start and connect node3.
  if (testOption === 1) {
    console.log('Option 1: Starting node3 before providing %s with node1', cid.toString());
    await node3.start();
    await node2.peerStore.addressBook.set(node3.peerId, node3.multiaddrs);
    await node2.dial(node3.peerId);
  } else {
    console.log('Option 2: node3 not started before providing %s with node1', cid.toString());
  }
  console.log('Waiting for delay1 - %s ms', delay1);
  await delay(delay1);  // Wait for onConnect handlers in the DHT

  // Provide content with node1.
  console.log('Providing %s with node1', cid.toString());
  await node1.contentRouting.provide(cid);
  console.log('node1 is providing %s', cid.toString());
  console.log('Waiting for delay2 - %s ms', delay2);
  await delay(delay2);  // wait for propagation

  // Option 2: Start and connect node3 if not already started.
  if (testOption === 2) {
    console.log('Option 2: Starting node3 after node1 provided %s', cid.toString());
    await node3.start();
    await node2.peerStore.addressBook.set(node3.peerId, node3.multiaddrs);
    await node2.dial(node3.peerId);
    console.log('Waiting for delay3 - %s ms', delay3);
    await delay(delay3);  // Wait for onConnect handlers in the DHT
  }

  // Search for node1's content from node3.
  const t0 = Date.now();
  try {
    for await (const provider of node3.contentRouting.findProviders(cid, { timeout: 3000 })) {
      console.log('Found provider from node3 in %s ms for %s: %s', Date.now() - t0, cid.toString(), provider.id.toB58String());
      console.log('OK');
      process.exit(0);
    }
  } catch (_err) {
    console.log('ERROR: No provider found from node3 in %s ms for %s', Date.now() - t0, cid.toString());
    process.exit(1);
  }
})();

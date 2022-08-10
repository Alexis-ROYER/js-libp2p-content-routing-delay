## Motivation

Based on the [js-libp2p/examples/peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/master/examples/peer-and-content-routing/2.js) example,
this test project aims at investigating on [js-libp2p](https://github.com/libp2p/js-libp2p/) delays to respect when using content routing mechanisms.

See also [js-libp2p#950](https://github.com/libp2p/js-libp2p/issues/950).


## Description

The *test-content-routing.xjs* test scripts in the 'js-libp2p@0.36.2', 'js-libp2p@0.37.3', ... directories
inspired from [js-libp2p/examples/peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/master/examples/peer-and-content-routing/2.js),
start 3 nodes:
- node1: the content provider
- node2: an intermediate node
- node3: the content querier,
  but on the contrary with the initial [peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/master/examples/peer-and-content-routing/2.js),
  this node may not be started yet when node1 announces its content.

Considering that timing effects are involved, these scripts take 4 arguments:
1. `testOption`: Either 1 or 2:
    - Option 1: node3 started with node1 and node2,
      i.e. before node1 announces its content.
    - Option 2: node3 started after node1 has announced its content.
2. `delay1`: *onConnect handlers delay*
    - Waiting time in ms, after the first nodes have been started (with or without node3),
      and before node1 announces its content.
3. `delay2`: *propagation delay*
    - Waiting time in ms, after node1 has announced its content,
      and before node3 is started and/or queries for node1's content.
4. `delay3`: *onConnect handlers delay* again
    - Applicable when `testOption` is 2.
    - Waiting time in ms, after node3 has been started,
      and before node3 queries for node1's content.

The [repeat.sh](./repeat.sh) bash script repeats 10 executions of the script above,
and counts successes and failures,
in order to qualify empirical results.


## Experimentations

See details in:
- [js-libp2p@0.36.2](./js-libp2p%400.36.2/)
- [js-libp2p@0.37.3](./js-libp2p%400.37.3/)


## Conclusions

It seems that some time must be awaited before a provider provides some content to the network (delay1),
otherwise `Failed to provide - no peers found` errors are raised:
- js-libp2p@0.36.2: about 30 ms
- js-libp2p@0.37.3: about 70 ms

In this configuration (only a single intermediate node, i.e. node2),
no need to await for content propagation (delay2).

And particularly with js-libp2p@0.37.3,
it seems that some time must be awaited before a querier asks for the content (delay3):
- js-libp2p@0.36.2: 0 ms
- js-libp2p@0.37.3: about 10 ms

**This test discloses the need for the identification of a formal event from the content routing system before providing or querying content.**

Questions:
- Since the times that must be awaited (delay1 and delay3)
  take place after the connection is established with the single remote peer in this test case,
  what would be the nature of that event?
  A global event for the rouing system?
  Or multiple events, one per peer?

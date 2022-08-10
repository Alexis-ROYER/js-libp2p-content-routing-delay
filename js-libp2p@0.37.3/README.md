## Test configuration

Version : js-libp2p@0.37.3
OS: Windows (with Git-Bash)


## Installation

```bash
npm clean-install
```


## Experimentations

### Default timings

Execute the test scenario in the same conditions as [peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/v0.37.3/examples/peer-and-content-routing/2.js):
```bash
$ ../repeat.sh node ./test-content-routing.mjs 1 100 300 100
```
```
Success: 10/10
```

Keeping the same timings, but have node3 start after node1 has announced its content:
```bash
$ ../repeat.sh node ./test-content-routing.mjs 2 100 300 100
```
```
Success: 10/10
```


### Test option 1

Default configuration:
```bash
$ ../repeat.sh node ./test-content-routing.mjs 1 100 300
```
=> success (score = 10/10)

Lower delay1:
```bash
$ ../repeat.sh node ./test-content-routing.mjs 1 0 300
```
=> success (score = 10/10)

Then lower delay2:
```bash
$ ../repeat.sh node ./test-content-routing.mjs 1 0 0
```
=> success (score = 10/10)


### Test option 2

Default configuration:
```bash
$ ../repeat.sh node ./test-content-routing.mjs 2 100 300 100
```
=> success (score = 10/10)

Lower delay1:
```bash
../repeat.sh node ./test-content-routing.mjs 2 0 300 100
```
=> fails systematically (score = 0/10) with `Failed to provide - no peers found` errors

Fine tune delay1:
- 10 ms => Success: 0/10
- 20 ms => Success: 0/10
- 30 ms => Success: 0/10
- 40 ms => Success: 4/10
- 50 ms => Success: 10/10, Success: 6/10
- 60 ms => Success: 10/10, Success: 9/10
- 70 ms => Success: 10/10, Success: 10/10 (still may fail at rare times)

Lower delay2:
```bash
../repeat.sh node ./test-content-routing.mjs 2 70 0 100
```
=> success (score = 10/10)

Lower delay3:
```bash
../repeat.sh node ./test-content-routing.mjs 2 70 0 0
```
=> fails systematically (score = 0/10) with `Error: not found` errors

Fine tune delay3:
- 1 ms => Success: 0/10
- 3 ms => Success: 0/10
- 4 ms => Success: 6/10
- 5 ms => Success: 7/10, Success: 9/10
- 10 ms => Success: 10/10, Success: 10/10

Try to shift delay3 to delay2:
```bash
../repeat.sh node ./test-content-routing.mjs 2 70 10 0
```
=> fails systematically (score = 0/10) with `Error: not found` errors



## Conclusions

Same as js-libp2p@0.36.2,
time must be awaited before the content is provided to the network (delay1),
otherwise `Failed to provide - no peers found` errors are raised.

But while js-libp2p@0.36.2 required only 30 ms for that,
js-libp2p@0.37.3 requires 70 ms at least on my configuration
(which comes to be close to the 100 ms given in the [peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/v0.37.3/examples/peer-and-content-routing/2.js) example).

> **Note**
>
> Same as js-libp2p@0.36.2,
> such `Failed to provide - no peers found` errors only occur when two nodes are started and connected at the beginning (option 2),
> which may be explained but some delay caused but the third node startup at the beginning with option 1.

Same as js-libp2p@0.36.2,
no need to await for propagation (delay2) apparently.

But on the contrary with js-libp2p@0.36.2,
time must now be awaited before querying the content (delay3),
about 10 ms on my configuration,
otherwise `Error: not found` errors occur.

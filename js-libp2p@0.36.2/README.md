## Test configuration

Version : js-libp2p@0.36.2
OS: Windows (with Git-Bash)


## Installation

```bash
npm clean-install
```


## Experimentations

### Default timings

Execute the test scenario in the same conditions as [peer-and-content-routing/2.js](https://github.com/libp2p/js-libp2p/blob/v0.36.2/examples/peer-and-content-routing/2.js):
```bash
$ ../repeat.sh node ./test-content-routing.cjs 1 100 300 100
```
```
Success: 10/10
```

Keeping the same timings, but have node3 start after node1 has announced its content:
```
$ ../repeat.sh node ./test-content-routing.cjs 2 100 300 100
```
```bash
Success: 10/10
```


### Test option 1

Default configuration:
```bash
../repeat.sh node ./test-content-routing.cjs 1 100 300
```
=> success (score = 10/10)

Lower delay1:
```bash
../repeat.sh node ./test-content-routing.cjs 1 0 300
```
=> success (score = 10/10)

Then lower delay2:
```bash
../repeat.sh node ./test-content-routing.cjs 1 0 0
```
=> success (score = 10/10)


### Test option 2

Default configuration:
```bash
../repeat.sh node ./test-content-routing.cjs 2 100 300 100
```
=> success (score = 10/10)

Lower delay1:
```bash
../repeat.sh node ./test-content-routing.cjs 2 0 300 100
```
=> fails systematically (score = 0/10) with `Failed to provide - no peers found` errors

Fine tune delay1:
- 10 ms => Success: 8/10
- 20 ms => Success: 10/10 (still may fail sometimes)
- 30 ms => Success: 10/10 (always succeeds)

Lower delay2:
```bash
../repeat.sh node ./test-content-routing.cjs 2 30 0 100
```
=> success (score = 10/10)

Lower delay3:
```bash
../repeat.sh node ./test-content-routing.cjs 2 30 0 0
```
=> success (score = 10/10)


## Conclusions

Apparently, time must be awaited before the content is provided to the network (delay1),
about 30 ms on my configuration,
otherwise `Failed to provide - no peers found` errors are raised.

> **Note**
>
> Such errors only occur when two nodes are started and connected at the beginning (option 2).
>
> This may be explained by the fact that launching a third node at the beginning (option 1)
> causes the required delay for the provide operation to succeed.

Once the content has been provided, no need to await
neither for propagation (delay2),
nor before querying the content (delay3).

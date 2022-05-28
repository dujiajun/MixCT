# MixCT: Mixing Confidential Transactions from Homomorphic Commitment

---

## Prerequisites

MixCT can be deployed and tested using [Truffle](https://www.trufflesuite.com/truffle) and [Ganache](https://github.com/trufflesuite/ganache).

### Required utilities

- Node.js, tested with version v16.15.0.
- Yarn, tested with version v1.22.18.

Run the following commands:

```bash
npm install -g yarn
npm install -g truffle
npm install -g ganache
```

In the main directory, type `yarn` to install all dependencies.

## Running Tests

Open two terminal windows.

Now, in one window, type
```bash
yarn server
```
In a second window, type
```bash
truffle test
```

This command should compile and deploy all necessary contracts, as well as run some example code.

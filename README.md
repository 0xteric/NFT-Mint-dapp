# Presale Smart Contract

This repository contains a secure Ethereum presale contract that allows users to purchase an ERC20 token in multiple phases using USDT, USDC, or ETH, and claim their tokens after the sale ends.

---

## 📜 Contract Overview

The Presale smart contract enables users to:

- Buy tokens in a multi-phase presale with configurable limits and prices.
- Pay using USDT, USDC, or native ETH.
- Claim purchased tokens after the presale ends.
- Prevent participation of blacklisted addresses.
- **Manage operations**: Allows the contract owner to manage phases, blacklist, and withdraw funds in emergencies.

---

## ⚙️ How It Works

### Buying with USDT / USDC

Users can buy presale tokens by calling a function that accepts:

- `_payingToken`: USDT or USDC contract address.
- `_payingAmount`: Amount in USD to spend.

**Requirements:**

- Presale must be active.
- Caller must not be blacklisted.

---

### Buying with ETH

Users can buy presale tokens using ETH:

- ETH is converted to USD using a Chainlink ETH/USD price feed.
- Token amount is calculated according to the current phase.

**Requirements:**

- Presale must be active.
- Caller must not be blacklisted.

---

### Phases

The presale consists of 3 phases. Each phase is defined by:

- Tokens available
- Price in USD
- Expiration timestamp

The contract automatically moves to the next phase when the current phase expires or its token limit is reached.

---

### Claiming Tokens

After the presale ends, users can claim their purchased tokens:

- Tokens are transferred to the caller.
- The user's internal balance is reset.

---

### Blacklist Management

The contract owner can manage the blacklist:

- Add addresses to the blacklist
- Remove addresses from the blacklist

**Notes:**

- Blacklisted addresses cannot participate in the presale.
- Only the owner can modify the blacklist.

---

### Emergency Functions (Owner Only)

The contract owner can recover funds in emergencies:

- Recover ERC20 tokens from the contract
- Recover native ETH from the contract

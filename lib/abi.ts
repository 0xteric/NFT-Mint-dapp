export const nftAbi = [
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "maxSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "mintPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "tokensOfOwner",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const marketplaceAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_initialFee",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },

  /* ─────────────── Views ─────────────── */

  {
    type: "function",
    name: "isListed",
    inputs: [
      { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "nextListingId",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketplaceFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "basisPoints",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxRoyaltyFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeReceiver",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalListings",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSales",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalVolume",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },

  /* ─────────────── Listings ─────────────── */

  {
    type: "function",
    name: "list",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenId", type: "uint256" },
      { name: "_price", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelList",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buy",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  /* ─────────────── Collection Bids ─────────────── */

  {
    type: "function",
    name: "bidCollection",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_price", type: "uint256" },
      { name: "_quantity", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "cancelCollectionBid",
    inputs: [{ name: "_collection", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptCollectionBid",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_bidder", type: "address" },
      { name: "_tokensId", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ─────────────── Token Bids ─────────────── */

  {
    type: "function",
    name: "bidToken",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenId", type: "uint256" },
      { name: "_price", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "acceptTokenBid",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_bidder", type: "address" },
      { name: "_tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelTokenBid",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ─────────────── Admin ─────────────── */

  {
    type: "function",
    name: "updateRoyalties",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_collectionOwner", type: "address" },
      { name: "_royalty", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateMarketplaceFee",
    inputs: [{ name: "_newFee", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateFeeReceiver",
    inputs: [{ name: "_newReceiver", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ─────────────── Events ─────────────── */

  {
    type: "event",
    name: "ListingCreated",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "seller", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ListingCancelled",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "seller", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ListingSold",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "seller", type: "address" },
      { indexed: false, name: "buyer", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
      { indexed: false, name: "marketplaceFee", type: "uint256" },
      { indexed: false, name: "royaltyFee", type: "uint256" },
    ],
  },

  {
    type: "event",
    name: "MarketplaceFeeUpdated",
    inputs: [
      { indexed: false, name: "oldFee", type: "uint256" },
      { indexed: false, name: "newFee", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "MarketplaceFeeReceiverUpdated",
    inputs: [{ indexed: true, name: "receiver", type: "address" }],
  },

  {
    type: "receive",
    stateMutability: "payable",
  },
] as const

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
  { inputs: [{ internalType: "uint256", name: "_initialFee", type: "uint256" }], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "List",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "CancelList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "BidCollection",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "BidToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
    ],
    name: "CancelBid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Sale",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
    ],
    name: "RoyaltiesUpdated",
    type: "event",
  },
  { anonymous: false, inputs: [{ indexed: true, internalType: "uint256", name: "fee", type: "uint256" }], name: "MarketplaceFeeUpdated", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, internalType: "address", name: "receiver", type: "address" }], name: "MarketplaceFeeReceiverUpdated", type: "event" },

  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      { internalType: "uint256", name: "_price", type: "uint256" },
    ],
    name: "list",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "cancelList",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_price", type: "uint256" },
      { internalType: "uint256", name: "_quantity", type: "uint256" },
    ],
    name: "bidCollection",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  { inputs: [{ internalType: "address", name: "_collection", type: "address" }], name: "cancelCollectionBid", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "address", name: "_bidder", type: "address" },
      { internalType: "uint256[]", name: "_tokensId", type: "uint256[]" },
    ],
    name: "acceptCollectionBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      { internalType: "uint256", name: "_price", type: "uint256" },
    ],
    name: "bidToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "address", name: "_bidder", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "acceptTokenBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "cancelTokenBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  { inputs: [{ internalType: "uint256", name: "_newFee", type: "uint256" }], name: "updateMarketplaceFee", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_newReceiver", type: "address" }], name: "updateFeeReceiver", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "address", name: "_collectionOwner", type: "address" },
      { internalType: "uint256", name: "_royalty", type: "uint256" },
    ],
    name: "updateRoyalties",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "listings",
    outputs: [
      { internalType: "address", name: "collection", type: "address" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "collectionBids",
    outputs: [
      { internalType: "address", name: "collection", type: "address" },
      { internalType: "address", name: "bidder", type: "address" },
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "tokenBids",
    outputs: [
      { internalType: "address", name: "collection", type: "address" },
      { internalType: "address", name: "bidder", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "royalties",
    outputs: [
      { internalType: "uint256", name: "fee", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },

  { inputs: [], name: "marketplaceFee", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "feeReceiver", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "basisPoints", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "maxRoyaltyFee", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
]

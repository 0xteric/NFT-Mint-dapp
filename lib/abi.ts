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

export const MarketplaceABI = [
  // Constructor
  {
    inputs: [
      { internalType: "address", name: "_bids", type: "address" },
      { internalType: "address", name: "_core", type: "address" },
      { internalType: "address", name: "_payments", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "oldFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newFee", type: "uint256" },
    ],
    name: "MarketplaceFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "address", name: "newReceiver", type: "address" }],
    name: "MarketplaceFeeReceiverUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "newRoyalty", type: "uint256" },
    ],
    name: "RoyaltiesUpdated",
    type: "event",
  },

  // Read-only contract references
  { inputs: [], name: "bids", outputs: [{ internalType: "contract Bids", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "core", outputs: [{ internalType: "contract MarketplaceCore", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "payments", outputs: [{ internalType: "contract Payments", name: "", type: "address" }], stateMutability: "view", type: "function" },

  // CORE functions
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
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "_prices", type: "uint256[]" },
    ],
    name: "listBatch",
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
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "cancelListBatch",
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
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "buyBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // BIDS functions
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
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
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
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "_prices", type: "uint256[]" },
    ],
    name: "bidTokenBatch",
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
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "cancelTokenBidBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ADMIN
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "address", name: "_newReceiver", type: "address" },
      { internalType: "uint256", name: "_newRoyalty", type: "uint256" },
    ],
    name: "updateCollectionRoyalties",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [{ internalType: "uint256", name: "_newFee", type: "uint256" }], name: "updateMarketplaceFee", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_newReceiver", type: "address" }], name: "updateFeeReceiver", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "switchRequireOwnable", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_newAddress", type: "address" }], name: "setPayments", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_newAddress", type: "address" }], name: "setCore", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_newAddress", type: "address" }], name: "setBids", outputs: [], stateMutability: "nonpayable", type: "function" },

  // Fallbacks
  { stateMutability: "payable", type: "receive" },
  { stateMutability: "payable", type: "fallback" },
] as const

export const MarketplaceCoreABI = [
  // Constructor
  {
    inputs: [{ internalType: "address", name: "_payments", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "royaltyFee", type: "uint256" },
    ],
    name: "CollectionRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "ListingCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "ListingCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "marketplaceFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "royaltyFee", type: "uint256" },
    ],
    name: "ListingSold",
    type: "event",
  },

  // Public state variables
  { inputs: [], name: "maxRoyaltyFee", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalListings", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalSales", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalVolume", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "nextListingId", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "marketplace", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "bidsModule", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "registeredCollections", outputs: [{ internalType: "address[]", name: "", type: "address[]" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "collections",
    outputs: [
      { internalType: "address", name: "collection", type: "address" },
      { internalType: "address", name: "royaltyReceiver", type: "address" },
      { internalType: "uint256", name: "royaltyFee", type: "uint256" },
      { internalType: "uint256", name: "totalVolume", type: "uint256" },
      { internalType: "uint256", name: "totalSales", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "listings",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },

  // Admin functions
  { inputs: [{ internalType: "address", name: "_bidsModule", type: "address" }], name: "setBidsModule", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_marketplace", type: "address" }], name: "setMarketplace", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "_payments", type: "address" }], name: "setPayments", outputs: [], stateMutability: "nonpayable", type: "function" },

  // Core functions
  {
    inputs: [
      { internalType: "uint256", name: "_price", type: "uint256" },
      { internalType: "address", name: "_royaltyReceiver", type: "address" },
      { internalType: "uint256", name: "_royaltyFee", type: "uint256" },
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "address", name: "_col", type: "address" },
    ],
    name: "distributePaymentsFromBids",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "removeListing",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_royaltyFee", type: "uint256" },
    ],
    name: "registerCollection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "address", name: "_receiver", type: "address" },
      { internalType: "uint256", name: "_fee", type: "uint256" },
    ],
    name: "setCollectionRoyalty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "_prices", type: "uint256[]" },
    ],
    name: "listBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "cancelListBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "buyBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const

export const BidsABI = [
  // Constructor
  {
    inputs: [{ internalType: "address", name: "_core", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: false, internalType: "uint256", name: "quantity", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "CollectionBidCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
    ],
    name: "CollectionBidCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "TokenBidCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "TokenBidCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "collection", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "marketplaceFee", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "royaltyFee", type: "uint256" },
    ],
    name: "BidSold",
    type: "event",
  },
  // Functions
  {
    inputs: [{ internalType: "address", name: "_core", type: "address" }],
    name: "setCore",
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
  {
    inputs: [{ internalType: "address", name: "_collection", type: "address" }],
    name: "cancelCollectionBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address", name: "_collection", type: "address" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
      { internalType: "uint256[]", name: "_prices", type: "uint256[]" },
    ],
    name: "bidTokenBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
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
      { internalType: "address", name: "_sender", type: "address" },
      { internalType: "address[]", name: "_collections", type: "address[]" },
      { internalType: "uint256[]", name: "_tokenIds", type: "uint256[]" },
    ],
    name: "cancelTokenBidBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

export const PaymentsABI = [
  // Constructor
  {
    inputs: [{ internalType: "uint256", name: "_marketplaceFee", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // Functions
  {
    inputs: [{ internalType: "address", name: "_core", type: "address" }],
    name: "setCore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_price", type: "uint256" },
      { internalType: "address", name: "_royaltyReceiver", type: "address" },
      { internalType: "uint256", name: "_royaltyFee", type: "uint256" },
      { internalType: "address", name: "_to", type: "address" },
    ],
    name: "distributePayments",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_newFee", type: "uint256" }],
    name: "updateMarketplaceFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newReceiver", type: "address" }],
    name: "updateFeeReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Public variables (read-only)
  {
    inputs: [],
    name: "basisPoints",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeReceiver",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketplaceFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "core",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

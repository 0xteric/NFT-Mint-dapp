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
      { name: "_bids", type: "address" },
      { name: "_core", type: "address" },
      { name: "_payments", type: "address" },
    ],
    stateMutability: "nonpayable",
  },

  /* ========= GETTERS ========= */

  {
    type: "function",
    name: "bids",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "core",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payments",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },

  /* ========= ADMIN ========= */

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
  {
    type: "function",
    name: "switchRequireOwnable",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateCollectionRoyalties",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_newReceiver", type: "address" },
      { name: "_newRoyalty", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePayments",
    inputs: [{ name: "_newAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateCore",
    inputs: [{ name: "_newAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateBids",
    inputs: [{ name: "_newAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= EVENTS ========= */

  {
    type: "event",
    name: "MarketplaceFeeUpdated",
    inputs: [
      { name: "oldFee", type: "uint256", indexed: false },
      { name: "newFee", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MarketplaceFeeReceiverUpdated",
    inputs: [{ name: "newReceiver", type: "address", indexed: false }],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoyaltiesUpdated",
    inputs: [
      { name: "collection", type: "address", indexed: false },
      { name: "newRoyalty", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },

  /* ========= OWNABLE ========= */

  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true },
      { name: "newOwner", type: "address", indexed: true },
    ],
    anonymous: false,
  },

  /* ========= FALLBACKS ========= */

  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "fallback",
    stateMutability: "payable",
  },
] as const

export const marketplaceCoreABI = [
  /* ========= CONSTRUCTOR ========= */
  {
    type: "constructor",
    inputs: [{ name: "_payments", type: "address" }],
    stateMutability: "nonpayable",
  },

  /* ========= CONSTANTS / STORAGE ========= */

  {
    type: "function",
    name: "maxRoyaltyFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
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
  {
    type: "function",
    name: "nextListingId",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketplace",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bidsModule",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payments",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },

  /* ========= ARRAYS ========= */

  {
    type: "function",
    name: "registeredCollections",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },

  /* ========= MAPPINGS ========= */

  {
    type: "function",
    name: "collections",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "collection", type: "address" },
      { name: "royaltyReceiver", type: "address" },
      { name: "royaltyFee", type: "uint256" },
      { name: "totalVolume", type: "uint256" },
      { name: "totalSales", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "listings",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" },
    ],
    stateMutability: "view",
  },

  /* ========= ADMIN ========= */

  {
    type: "function",
    name: "setBidsModule",
    inputs: [{ name: "_bidsModule", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setMarketplace",
    inputs: [{ name: "_marketplace", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPayments",
    inputs: [{ name: "_payments", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= CORE LOGIC ========= */

  {
    type: "function",
    name: "distributePayments",
    inputs: [
      { name: "_price", type: "uint256" },
      { name: "_royaltyReceiver", type: "address" },
      { name: "_royaltyFee", type: "uint256" },
      { name: "_to", type: "address" },
      { name: "_col", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "registerCollection",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_royaltyFee", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setCollectionRoyalty",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_receiver", type: "address" },
      { name: "_fee", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

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
    name: "listBatch",
    inputs: [
      { name: "_collections", type: "address[]" },
      { name: "_tokenIds", type: "uint256[]" },
      { name: "_prices", type: "uint256[]" },
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
    name: "cancelListBatch",
    inputs: [
      { name: "_collections", type: "address[]" },
      { name: "_tokenIds", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "removeListing",
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

  {
    type: "function",
    name: "buyBatch",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenIds", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  /* ========= EVENTS ========= */

  {
    type: "event",
    name: "CollectionRegistered",
    inputs: [
      { name: "collection", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "royaltyFee", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingCreated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: false },
      { name: "price", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingCancelled",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: false },
      { name: "price", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingSold",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: false },
      { name: "buyer", type: "address", indexed: false },
      { name: "price", type: "uint256", indexed: false },
      { name: "marketplaceFee", type: "uint256", indexed: false },
      { name: "royaltyFee", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },

  /* ========= OWNABLE ========= */

  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true },
      { name: "newOwner", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const

export const bidsABI = [
  /* ========= CONSTRUCTOR ========= */
  {
    type: "constructor",
    inputs: [{ name: "_core", type: "address" }],
    stateMutability: "nonpayable",
  },

  /* ========= STORAGE ========= */

  {
    type: "function",
    name: "core",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },

  /* ========= MAPPINGS ========= */

  {
    type: "function",
    name: "collectionBids",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    outputs: [
      { name: "bidder", type: "address" },
      { name: "quantity", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "tokenBids",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    outputs: [
      { name: "bidder", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    stateMutability: "view",
  },

  /* ========= ADMIN ========= */

  {
    type: "function",
    name: "setCore",
    inputs: [{ name: "_core", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= COLLECTION BIDS ========= */

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

  /* ========= TOKEN BIDS ========= */

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
    name: "bidTokenBatch",
    inputs: [
      { name: "_collection", type: "address" },
      { name: "_tokenIds", type: "uint256[]" },
      { name: "_prices", type: "uint256[]" },
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

  {
    type: "function",
    name: "cancelTokenBidBatch",
    inputs: [
      { name: "_collections", type: "address[]" },
      { name: "_tokenIds", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= EVENTS ========= */

  {
    type: "event",
    name: "CollectionBidCreated",
    inputs: [
      { name: "bidder", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "quantity", type: "uint256", indexed: false },
      { name: "price", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CollectionBidCancelled",
    inputs: [
      { name: "bidder", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenBidCreated",
    inputs: [
      { name: "bidder", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "price", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenBidCancelled",
    inputs: [
      { name: "bidder", type: "address", indexed: true },
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BidSold",
    inputs: [
      { name: "collection", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: false },
      { name: "buyer", type: "address", indexed: false },
      { name: "price", type: "uint256", indexed: false },
      { name: "marketplaceFee", type: "uint256", indexed: false },
      { name: "royaltyFee", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },

  /* ========= OWNABLE ========= */

  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true },
      { name: "newOwner", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const

export const paymentsABI = [
  /* ========= CONSTRUCTOR ========= */
  {
    type: "constructor",
    inputs: [{ name: "_marketplaceFee", type: "uint256" }],
    stateMutability: "nonpayable",
  },

  /* ========= CONSTANTS / STORAGE ========= */

  {
    type: "function",
    name: "basisPoints",
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
    name: "marketplaceFee",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "core",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },

  /* ========= ADMIN ========= */

  {
    type: "function",
    name: "setCore",
    inputs: [{ name: "_core", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "_updateMarketplaceFee",
    inputs: [{ name: "_newFee", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "_updateFeeReceiver",
    inputs: [{ name: "_newReceiver", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= PAYMENTS ========= */

  {
    type: "function",
    name: "_distributePayments",
    inputs: [
      { name: "_price", type: "uint256" },
      { name: "_royaltyReceiver", type: "address" },
      { name: "_royaltyFee", type: "uint256" },
      { name: "_to", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  /* ========= OWNABLE ========= */

  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true },
      { name: "newOwner", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const

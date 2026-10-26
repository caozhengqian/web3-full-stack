import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exchange
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const exchangeAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_feeAccount', internalType: 'address', type: 'address' },
      { name: '_feePercent', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_user', internalType: 'address', type: 'address' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositEther',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeAccout',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feePercent',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'uint256', type: 'uint256' }],
    name: 'fillOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenGet', internalType: 'address', type: 'address' },
      { name: '_amountGet', internalType: 'uint256', type: 'uint256' },
      { name: '_tokenGive', internalType: 'address', type: 'address' },
      { name: '_amountGive', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'makeOrder',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'orderCancel',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'orderCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'orderFill',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'orders',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'tokenGet', internalType: 'address', type: 'address' },
      { name: 'amountGet', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenGive', internalType: 'address', type: 'address' },
      { name: 'amountGive', internalType: 'uint256', type: 'uint256' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'tokens',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawEther',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_token', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenGet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGet',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenGive',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGive',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Cancel',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'balance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenGet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGet',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenGive',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGive',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Order',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'tokenGet',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGet',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenGive',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amountGive',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Trade',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'user',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'balance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
] as const

/**
 *
 */
export const exchangeAddress = {
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
} as const

/**
 *
 */
export const exchangeConfig = {
  address: exchangeAddress,
  abi: exchangeAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KerwinToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const kerwinTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_spender', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_from', internalType: 'address', type: 'address' },
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_from',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: '_to', internalType: 'address', type: 'address', indexed: true },
      {
        name: '_value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

/**
 *
 */
export const kerwinTokenAddress = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const

/**
 *
 */
export const kerwinTokenConfig = {
  address: kerwinTokenAddress,
  abi: kerwinTokenAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__
 *
 *
 */
export const useReadExchange = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"balanceOf"`
 *
 *
 */
export const useReadExchangeBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"feeAccout"`
 *
 *
 */
export const useReadExchangeFeeAccout = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'feeAccout',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"feePercent"`
 *
 *
 */
export const useReadExchangeFeePercent = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'feePercent',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"orderCancel"`
 *
 *
 */
export const useReadExchangeOrderCancel = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'orderCancel',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"orderCount"`
 *
 *
 */
export const useReadExchangeOrderCount = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'orderCount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"orderFill"`
 *
 *
 */
export const useReadExchangeOrderFill = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'orderFill',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"orders"`
 *
 *
 */
export const useReadExchangeOrders = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'orders',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"tokens"`
 *
 *
 */
export const useReadExchangeTokens = /*#__PURE__*/ createUseReadContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'tokens',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__
 *
 *
 */
export const useWriteExchange = /*#__PURE__*/ createUseWriteContract({
  abi: exchangeAbi,
  address: exchangeAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"cancelOrder"`
 *
 *
 */
export const useWriteExchangeCancelOrder = /*#__PURE__*/ createUseWriteContract(
  { abi: exchangeAbi, address: exchangeAddress, functionName: 'cancelOrder' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"depositEther"`
 *
 *
 */
export const useWriteExchangeDepositEther =
  /*#__PURE__*/ createUseWriteContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'depositEther',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"depositToken"`
 *
 *
 */
export const useWriteExchangeDepositToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'depositToken',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"fillOrder"`
 *
 *
 */
export const useWriteExchangeFillOrder = /*#__PURE__*/ createUseWriteContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'fillOrder',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"makeOrder"`
 *
 *
 */
export const useWriteExchangeMakeOrder = /*#__PURE__*/ createUseWriteContract({
  abi: exchangeAbi,
  address: exchangeAddress,
  functionName: 'makeOrder',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"withdrawEther"`
 *
 *
 */
export const useWriteExchangeWithdrawEther =
  /*#__PURE__*/ createUseWriteContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'withdrawEther',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"withdrawToken"`
 *
 *
 */
export const useWriteExchangeWithdrawToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__
 *
 *
 */
export const useSimulateExchange = /*#__PURE__*/ createUseSimulateContract({
  abi: exchangeAbi,
  address: exchangeAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"cancelOrder"`
 *
 *
 */
export const useSimulateExchangeCancelOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'cancelOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"depositEther"`
 *
 *
 */
export const useSimulateExchangeDepositEther =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'depositEther',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"depositToken"`
 *
 *
 */
export const useSimulateExchangeDepositToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'depositToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"fillOrder"`
 *
 *
 */
export const useSimulateExchangeFillOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'fillOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"makeOrder"`
 *
 *
 */
export const useSimulateExchangeMakeOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'makeOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"withdrawEther"`
 *
 *
 */
export const useSimulateExchangeWithdrawEther =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'withdrawEther',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link exchangeAbi}__ and `functionName` set to `"withdrawToken"`
 *
 *
 */
export const useSimulateExchangeWithdrawToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: exchangeAbi,
    address: exchangeAddress,
    functionName: 'withdrawToken',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__
 *
 *
 */
export const useWatchExchangeEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: exchangeAbi,
  address: exchangeAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__ and `eventName` set to `"Cancel"`
 *
 *
 */
export const useWatchExchangeCancelEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: exchangeAbi,
    address: exchangeAddress,
    eventName: 'Cancel',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__ and `eventName` set to `"Deposit"`
 *
 *
 */
export const useWatchExchangeDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: exchangeAbi,
    address: exchangeAddress,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__ and `eventName` set to `"Order"`
 *
 *
 */
export const useWatchExchangeOrderEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: exchangeAbi,
    address: exchangeAddress,
    eventName: 'Order',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__ and `eventName` set to `"Trade"`
 *
 *
 */
export const useWatchExchangeTradeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: exchangeAbi,
    address: exchangeAddress,
    eventName: 'Trade',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link exchangeAbi}__ and `eventName` set to `"Withdraw"`
 *
 *
 */
export const useWatchExchangeWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: exchangeAbi,
    address: exchangeAddress,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__
 *
 *
 */
export const useReadKerwinToken = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"allowance"`
 *
 *
 */
export const useReadKerwinTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"balanceOf"`
 *
 *
 */
export const useReadKerwinTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"decimals"`
 *
 *
 */
export const useReadKerwinTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"name"`
 *
 *
 */
export const useReadKerwinTokenName = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"symbol"`
 *
 *
 */
export const useReadKerwinTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"totalSupply"`
 *
 *
 */
export const useReadKerwinTokenTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link kerwinTokenAbi}__
 *
 *
 */
export const useWriteKerwinToken = /*#__PURE__*/ createUseWriteContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useWriteKerwinTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useWriteKerwinTokenTransfer = /*#__PURE__*/ createUseWriteContract(
  {
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'transfer',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useWriteKerwinTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link kerwinTokenAbi}__
 *
 *
 */
export const useSimulateKerwinToken = /*#__PURE__*/ createUseSimulateContract({
  abi: kerwinTokenAbi,
  address: kerwinTokenAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useSimulateKerwinTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useSimulateKerwinTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link kerwinTokenAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useSimulateKerwinTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link kerwinTokenAbi}__
 *
 *
 */
export const useWatchKerwinTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link kerwinTokenAbi}__ and `eventName` set to `"Approval"`
 *
 *
 */
export const useWatchKerwinTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link kerwinTokenAbi}__ and `eventName` set to `"Transfer"`
 *
 *
 */
export const useWatchKerwinTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: kerwinTokenAbi,
    address: kerwinTokenAddress,
    eventName: 'Transfer',
  })

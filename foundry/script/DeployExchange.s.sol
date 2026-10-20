// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Exchange} from "../src/Exchange.sol";

/// @notice 部署交易所的脚本
/// 构造参数：
///   FEE_ACCOUNT  收费账号，默认取部署者本人（msg.sender）
///   FEE_PERCENT  收费费率（百分数），默认 1，即收取成交量的 1%
/// 用法：
///   forge script script/DeployExchange.s.sol:DeployExchangeScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
///   FEE_ACCOUNT=0x... FEE_PERCENT=10 forge script script/DeployExchange.s.sol:DeployExchangeScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
contract DeployExchangeScript is Script {
    Exchange public exchange;

    address public feeAccount;
    uint256 public feePercent;

    function run() public returns (Exchange) {
        feeAccount = vm.envOr("FEE_ACCOUNT", msg.sender);
        feePercent = vm.envOr("FEE_PERCENT", uint256(10));

        vm.startBroadcast();

        exchange = new Exchange(feeAccount, feePercent);

        vm.stopBroadcast();

        console.log("Exchange deployed at:", address(exchange));
        console.log("  feeAccount:", exchange.feeAccout());
        console.log("  feePercent:", exchange.feePercent());

        return exchange;
    }
}

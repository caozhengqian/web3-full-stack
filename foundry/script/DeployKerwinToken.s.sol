// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {KerwinToken} from "../src/KerwinToken.sol";

/// @notice 部署 KWT 代币的脚本
/// 用法：
///   forge script script/DeployKerwinToken.s.sol:DeployKerwinTokenScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
contract DeployKerwinTokenScript is Script {
    KerwinToken public token;

    function run() public returns (KerwinToken) {
        vm.startBroadcast();

        token = new KerwinToken();

        vm.stopBroadcast();

        console.log("KerwinToken deployed at:", address(token));
        console.log("  name:   ", token.name());
        console.log("  symbol: ", token.symbol());
        console.log("  supply: ", token.totalSupply());

        return token;
    }
}


```bash
anvil
```
```bash
 cd foundry && source .env && forge script script/DeployKerwinToken.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY && forge script script/DeployExchange.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY

 cd .. && pnpm run generate && pnpm dev
```
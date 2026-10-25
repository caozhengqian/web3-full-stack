import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'

export default defineConfig({
    out: 'src/generated.ts',
    contracts: [],
    plugins: [
        foundry({
            // Foundry 项目根目录，ABI 从 foundry/out 读取
            project: './foundry',
            // 只生成业务合约（排除 forge-std 依赖、脚本、测试）
            include: ['KerwinToken.sol/*.json', 'Exchange.sol/*.json'],
            // 从 foundry/broadcast/**/run-latest.json 读取部署地址
            includeBroadcasts: true,
        }),
        react(),
    ],
})

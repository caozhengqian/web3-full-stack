// SPDX-License-Identifier: UNLICENSED
// 上面这行是许可证声明：UNLICENSED 表示未授权许可。SPDX 行必须单独成行且不能尾随注释，否则会报错
pragma solidity ^0.8.13;                                       // 指定 Solidity 编译器版本：0.8.13 及以上

import {Test, console} from "forge-std/Test.sol";              // 从 forge-std 标准库导入 Test 和 console 工具
import {Exchange} from "../src/Exchange.sol";                  // 导入被测试的 Exchange 合约
import {KerwinToken} from "../src/KerwinToken.sol";            // 导入测试用到的 KerwinToken 代币合约

contract ExchangeTest is Test {                                 // 定义测试合约 ExchangeTest，继承 forge-std 的 Test 基类
    Exchange public exchange;                                   // 声明被测试的 Exchange 合约实例变量
    KerwinToken public token;                                   // 声明测试代币 KerwinToken 实例变量

    address public owner = address(this);                       // 声明 owner 地址，指向当前测试合约自身地址
    address public alice = makeAddr("alice");                   // 使用 makeAddr 为字符串 "alice" 生成一个确定性测试地址
    address public bob = makeAddr("bob");                       // 使用 makeAddr 为字符串 "bob" 生成一个确定性测试地址
    address public feeAccount = makeAddr("feeAccount");         // 使用 makeAddr 为字符串 "feeAccount" 生成手续费账户地址

    // Exchange 合约里用 address(0) 代表 ETH                        // 说明：交易所中 address(0) 这一零地址代表原生代币 ETH
    address public constant ETHER = address(0);                 // 定义常量 ETHER 为 address(0)，用于表示 ETH

    uint256 public constant FEE_PERCENT = 10;                   // 定义常量手续费比例 FEE_PERCENT 为 10（即 10%）

    event Deposit(address token, address user, uint256 amount, uint256 balance);   // 声明 Deposit 事件：记录存款的代币、用户、金额与余额
    event Withdraw(address token, address user, uint256 amount, uint256 balance);  // 声明 Withdraw 事件：记录取款的代币、用户、金额与余额
    event Order(                                               // 声明 Order 订单事件
        uint256 id,                                            // 订单 ID
        address user,                                          // 下单用户地址
        address tokenGet,                                      // 想获得的代币地址
        uint256 amountGet,                                     // 想获得的代币数量
        address tokenGive,                                     // 想付出的代币地址
        uint256 amountGive,                                    // 想付出的代币数量
        uint256 timestamp                                      // 下单时间戳
    );                                                          // Order 事件定义结束
    event Cancel(                                              // 声明 Cancel 撤单事件
        uint256 id,                                            // 被撤销订单的 ID
        address user,                                          // 撤单用户地址
        address tokenGet,                                      // 订单想获得的代币地址
        uint256 amountGet,                                     // 订单想获得的代币数量
        address tokenGive,                                     // 订单想付出的代币地址
        uint256 amountGive,                                    // 订单想付出的代币数量
        uint256 timestamp                                      // 撤单时间戳
    );                                                          // Cancel 事件定义结束
    event Trade(                                               // 声明 Trade 成交事件
        uint256 id,                                            // 成交订单的 ID
        address user,                                          // 成交的用户地址
        address tokenGet,                                      // 成交中获得的代币地址
        uint256 amountGet,                                     // 成交中获得的代币数量
        address tokenGive,                                     // 成交中付出的代币地址
        uint256 amountGive,                                    // 成交中付出的代币数量
        uint256 timestamp                                      // 成交时间戳
    );                                                          // Trade 事件定义结束

    function setUp() public {                                   // setUp 函数：每个测试用例执行前都会运行一次，用于初始化状态
        token = new KerwinToken();                              // 部署一个新的 KerwinToken 代币合约
        exchange = new Exchange(feeAccount, FEE_PERCENT);       // 部署 Exchange 合约，传入手续费账户和手续费比例

        // 给 alice 和 bob 分一些 KWT                                     // 说明：向测试账户分发测试代币
        token.transfer(alice, 100_000);                         // 向 alice 转账 100000 枚 KWT
        token.transfer(bob, 100_000);                           // 向 bob 转账 100000 枚 KWT

        // 授权交易所调用 transferFrom                                       // 说明：授权交易所代扣代币
        vm.prank(alice);                                        // 将后续调用者的 msg.sender 设为 alice
        token.approve(address(exchange), type(uint256).max);    // alice 授权交易所无限额度调用 transferFrom
        vm.prank(bob);                                          // 将后续调用者的 msg.sender 设为 bob
        token.approve(address(exchange), type(uint256).max);    // bob 授权交易所无限额度调用 transferFrom

        // 给 alice 和 bob 一些 ETH                                           // 说明：向测试账户分配原生 ETH
        vm.deal(alice, 100 ether);                              // 给 alice 分配 100 ETH 余额
        vm.deal(bob, 100 ether);                                // 给 bob 分配 100 ETH 余额

        // 固定时间戳，方便断言订单相关事件                                   // 说明：固定区块时间戳便于事件断言
        vm.warp(1_000_000);                                     // 将区块时间戳固定为 1000000
    }

    // ---------- 构造器 / 初始状态 ----------                    // 分区注释：以下测试构造器与初始状态

    function test_Constructor() public view {                  // 测试构造函数是否正确设置初始状态
        assertEq(exchange.feeAccout(), feeAccount);            // 断言交易所的手续费账户等于预期 feeAccount
        assertEq(exchange.feePercent(), FEE_PERCENT);          // 断言交易所的手续费比例等于预期 FEE_PERCENT
    }

    // ---------- depositEther ----------                        // 分区注释：以下测试 ETH 存款功能

    function test_DepositEther() public {                       // 测试存入 ETH 的基本流程
        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次事件（四个参数均匹配）
        emit Deposit(ETHER, alice, 10 ether, 10 ether);         // 预先发出预期的事件用于 expectEmit 校验

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 10 ether}();               // alice 向交易所存入 10 ETH（附带 value）

        assertEq(exchange.balanceOf(ETHER, alice), 10 ether);   // 断言 alice 在交易所的 ETH 余额为 10 ether
        assertEq(address(exchange).balance, 10 ether);          // 断言交易所合约自身的 ETH 余额为 10 ether
    }

    function test_DepositEther_MultipleDepositsAccumulate() public {  // 测试多次存款 ETH 是否累加
        vm.startPrank(alice);                                   // 开始以 alice 身份模拟，后续调用 msg.sender 均为 alice
        exchange.depositEther{value: 3 ether}();                // alice 第一次存入 3 ETH
        exchange.depositEther{value: 2 ether}();                // alice 第二次存入 2 ETH
        vm.stopPrank();                                         // 结束 alice 身份的模拟

        assertEq(exchange.balanceOf(ETHER, alice), 5 ether);    // 断言 alice 的 ETH 余额累加为 5 ether
    }

    // ---------- depositToken ----------                        // 分区注释：以下测试 ERC20 代币存款功能

    function test_DepositToken() public {                       // 测试存入 ERC20 代币的基本流程
        uint256 amount = 1000;                                  // 定义存款数量为 1000

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Deposit 事件
        emit Deposit(address(token), alice, amount, amount);    // 预先发出预期的 Deposit 事件

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositToken(address(token), amount);          // alice 向交易所存入 1000 枚 KWT

        assertEq(exchange.balanceOf(address(token), alice), amount);    // 断言 alice 在交易所的 KWT 余额为 1000
        assertEq(token.balanceOf(address(exchange)), amount);   // 断言交易所合约持有的 KWT 数量为 1000
    }

    function test_DepositToken_RevertWhenTokenIsEther() public {  // 测试存入代币时传入 ETHER 地址应回滚
        vm.prank(alice);                                        // 将后续调用者设为 alice
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.depositToken(ETHER, 1000);                     // 尝试存入 ETHER 地址（应回滚，因为 ETH 应走 depositEther）
    }

    function test_DepositToken_RevertWithoutApproval() public {  // 测试未授权时存款代币应回滚
        // 未授权的账号 charlie                                          // 说明：引入一个未做授权的测试账号
        address charlie = makeAddr("charlie");                  // 生成 charlie 测试地址
        token.transfer(charlie, 1000);                          // 向 charlie 转账 1000 枚 KWT（但不做 approve）

        vm.prank(charlie);                                      // 将后续调用者设为 charlie
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.depositToken(address(token), 1000);            // charlie 尝试存款 KWT（因未授权 transferFrom 而回滚）
    }

    // ---------- withdrawEther ----------                       // 分区注释：以下测试 ETH 取款功能

    function test_WithdrawEther() public {                      // 测试提取 ETH 的基本流程
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 10 ether}();               // alice 先存入 10 ETH 作为取款前提

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Withdraw 事件
        emit Withdraw(ETHER, alice, 4 ether, 6 ether);          // 预先发出预期的 Withdraw 事件（取出 4，剩余 6）

        uint256 before = alice.balance;                         // 记录 alice 取款前的 ETH 余额
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.withdrawEther(4 ether);                        // alice 从交易所取出 4 ETH
        uint256 after_ = alice.balance;                         // 记录 alice 取款后的 ETH 余额

        assertEq(exchange.balanceOf(ETHER, alice), 6 ether);    // 断言 alice 在交易所的 ETH 余额剩余 6 ether
        assertEq(after_ - before, 4 ether);                     // 断言 alice 实际收到的 ETH 为 4 ether（前后余额差）
    }

    function test_WithdrawEther_RevertWhenInsufficient() public {  // 测试 ETH 余额不足时取款应回滚
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 1 ether}();                // alice 只存入 1 ETH

        vm.prank(alice);                                        // 将后续调用者设为 alice
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.withdrawEther(2 ether);                        // alice 尝试取出 2 ETH（超过余额，应回滚）
    }

    // ---------- withdrawToken ----------                       // 分区注释：以下测试 ERC20 代币取款功能

    function test_WithdrawToken() public {                      // 测试提取 ERC20 代币的基本流程
        uint256 amount = 1000;                                  // 定义存款数量为 1000

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositToken(address(token), amount);          // alice 先存入 1000 枚 KWT 作为取款前提

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Withdraw 事件
        emit Withdraw(address(token), alice, 400, 600);         // 预先发出预期的 Withdraw 事件（取出 400，剩余 600）

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.withdrawToken(address(token), 400);            // alice 从交易所取出 400 枚 KWT

        assertEq(exchange.balanceOf(address(token), alice), 600);   // 断言 alice 在交易所的 KWT 余额剩余 600
        assertEq(token.balanceOf(alice), 100_000 - amount + 400);   // 断言 alice 钱包 KWT 余额 = 初始 100000 - 存入 1000 + 取出 400
    }

    function test_WithdrawToken_RevertWhenInsufficient() public {  // 测试代币余额不足时取款应回滚
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositToken(address(token), 100);             // alice 只存入 100 枚 KWT

        vm.prank(alice);                                        // 将后续调用者设为 alice
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.withdrawToken(address(token), 101);            // alice 尝试取出 101 枚 KWT（超过余额，应回滚）
    }

    function test_WithdrawToken_RevertWhenTokenIsEther() public {  // 测试取款时传入 ETHER 地址应回滚
        vm.prank(alice);                                        // 将后续调用者设为 alice
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.withdrawToken(ETHER, 100);                     // 尝试以 withdrawToken 提取 ETH（应回滚，应走 withdrawEther）
    }

    // ---------- balanceOf ----------                           // 分区注释：以下测试余额查询功能

    function test_BalanceOf_DefaultZero() public view {         // 测试未存款时余额默认为 0
        assertEq(exchange.balanceOf(ETHER, alice), 0);          // 断言 alice 的 ETH 余额默认为 0
        assertEq(exchange.balanceOf(address(token), bob), 0);   // 断言 bob 的 KWT 余额默认为 0
    }

    // ---------- makeOrder ----------                           // 分区注释：以下测试创建订单功能

    function test_MakeOrder() public {                          // 测试创建订单的基本流程
        // alice 存 100 ETH                                               // 说明：alice 先存入 100 ETH 作为挂单保证金
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Order 事件
        emit Order(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);  // 预先发出预期的 Order 事件

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 创建订单：想获得 1000 KWT，付出 10 ETH

        assertEq(exchange.orderCount(), 1);                     // 断言订单总数变为 1
        (uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive,) =
            exchange.orders(1);                                 // 从交易所读取 1 号订单的字段（忽略 timestamp）
        assertEq(id, 1);                                        // 断言订单 ID 为 1
        assertEq(user, alice);                                  // 断言下单用户为 alice
        assertEq(tokenGet, address(token));                     // 断言想获得的代币为 KWT
        assertEq(amountGet, 1000);                              // 断言想获得的代币数量为 1000
        assertEq(tokenGive, ETHER);                             // 断言想付出的代币为 ETH
        assertEq(amountGive, 10 ether);                         // 断言想付出的代币数量为 10 ether
    }

    function test_MakeOrder_RevertWhenInsufficientGiveBalance() public {  // 测试付出余额不足时创建订单应回滚
        // alice 只有 1 ETH，但想挂 10 ETH 的卖单                             // 说明：构造余额不足的场景
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 1 ether}();                // alice 只存入 1 ETH

        vm.prank(alice);                                        // 将后续调用者设为 alice
        vm.expectRevert(unicode"创建订单的余额不足");              // 声明预期回滚并校验回滚原因字符串
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 尝试挂出 10 ETH 的卖单（余额不足，应回滚）
    }

    function test_MakeOrder_IncrementsOrderCount() public {     // 测试连续创建订单时订单总数是否正确累加
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH 作为保证金

        vm.startPrank(alice);                                   // 开始以 alice 身份连续模拟
        exchange.makeOrder(address(token), 100, ETHER, 1 ether);    // alice 创建第一个订单
        exchange.makeOrder(address(token), 200, ETHER, 2 ether);    // alice 创建第二个订单
        vm.stopPrank();                                         // 结束 alice 身份的模拟

        assertEq(exchange.orderCount(), 2);                     // 断言订单总数累加为 2
    }

    // ---------- cancelOrder ----------                         // 分区注释：以下测试撤销订单功能

    function test_CancelOrder() public {                        // 测试撤销订单的基本流程
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 创建一个订单

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Cancel 事件
        emit Cancel(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);  // 预先发出预期的 Cancel 事件

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.cancelOrder(1);                                // alice 撤销 1 号订单

        assertTrue(exchange.orderCancel(1));                    // 断言 1 号订单的撤销标志为 true
    }

    function test_CancelOrder_RevertWhenNonExistent() public {  // 测试撤销不存在的订单应回滚
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.cancelOrder(999);                              // 尝试撤销不存在的 999 号订单（应回滚）
    }

    // ---------- fillOrder ----------                           // 分区注释：以下测试成交订单功能

    function test_FillOrder() public {                          // 测试成交订单的基本流程
        // alice 存 100 ETH（挂单方，出 ETH）                                  // 说明：挂单方 alice 提供 ETH
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH
        // bob 存 2000 KWT（吃单方，出 KWT）                                  // 说明：吃单方 bob 提供 KWT
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.depositToken(address(token), 2000);            // bob 存入 2000 枚 KWT

        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 挂单：想获得 1000 KWT，付出 10 ETH

        vm.expectEmit(true, true, true, true);                  // 声明预期会发出一次 Trade 事件
        emit Trade(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);  // 预先发出预期的 Trade 事件

        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.fillOrder(1);                                  // bob 吃下 1 号订单完成成交

        // 手续费 = amountGet * feePercent / 100 = 1000 * 10 / 100 = 100 KWT     // 说明：手续费计算方式
        // bob 出 1000 + 100 = 1100 KWT，得 10 ETH                               // 说明：吃单方付出本金加手续费
        assertEq(exchange.balanceOf(address(token), bob), 2000 - 1100); // 900  // 断言 bob 剩余 KWT = 2000 - 1100 = 900
        // 手续费进入 feeAccount                                                  // 说明：手续费划入手续费账户
        assertEq(exchange.balanceOf(address(token), feeAccount), 100);  // 断言手续费账户获得 100 KWT
        // alice 得 1000 KWT                                                      // 说明：挂单方获得其想要的代币
        assertEq(exchange.balanceOf(address(token), alice), 1000);  // 断言 alice 获得 1000 KWT
        // bob 得 10 ETH                                                          // 说明：吃单方获得其想要的 ETH
        assertEq(exchange.balanceOf(ETHER, bob), 10 ether);    // 断言 bob 获得 10 ETH
        // alice 出 10 ETH                                                          // 说明：挂单方付出其承诺的 ETH
        assertEq(exchange.balanceOf(ETHER, alice), 90 ether);  // 断言 alice 剩余 ETH = 100 - 10 = 90 ether

        assertTrue(exchange.orderFill(1));                      // 断言 1 号订单的成交标志为 true
    }

    function test_FillOrder_RevertWhenNonExistent() public {    // 测试成交不存在的订单应回滚
        vm.prank(bob);                                          // 将后续调用者设为 bob
        vm.expectRevert();                                      // 声明预期下一次调用会回滚
        exchange.fillOrder(999);                                // bob 尝试成交不存在的 999 号订单（应回滚）
    }

    function test_FillOrder_RevertWhenMakerGiveInsufficient() public {  // 测试挂单方付出余额不足时成交应回滚
        // alice 挂 10 ETH 卖单后，把 ETH 全部取走                             // 说明：构造挂单方余额不足场景
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 挂出 10 ETH 卖单
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.withdrawEther(95 ether); // 剩 5 ETH，不足 10 ETH           // alice 取出 95 ETH，剩余 5 ETH 不足以履约

        // bob 有足够的 KWT                                                  // 说明：吃单方余额充足
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.depositToken(address(token), 2000);            // bob 存入 2000 枚 KWT

        vm.prank(bob);                                          // 将后续调用者设为 bob
        vm.expectRevert(unicode"创建者的give余额不足");             // 声明预期回滚并校验回滚原因字符串
        exchange.fillOrder(1);                                  // bob 尝试成交（挂单方 ETH 不足，应回滚）
    }

    function test_FillOrder_RevertWhenTakerGetInsufficient() public {  // 测试吃单方付出余额不足时成交应回滚
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 挂出 10 ETH 卖单

        // bob 只有 1000 KWT，但需要 1000 + 100(手续费) = 1100 KWT             // 说明：构造吃单方余额不足场景
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.depositToken(address(token), 1000);            // bob 只存入 1000 枚 KWT（不足以支付本金加手续费）

        vm.prank(bob);                                          // 将后续调用者设为 bob
        vm.expectRevert(unicode"购买者的get+“小费”余额不足");      // 声明预期回滚并校验回滚原因字符串
        exchange.fillOrder(1);                                  // bob 尝试成交（余额不足，应回滚）
    }

    function test_FillOrder_ZeroFee() public {                  // 测试零手续费率下的成交流程
        // 单独部署一个费率为 0 的交易所                                           // 说明：部署费率为 0 的独立交易所
        Exchange zeroFee = new Exchange(feeAccount, 0);         // 部署一个手续费比例为 0 的新交易所 zeroFee
        vm.prank(alice);                                        // 将后续调用者设为 alice
        token.approve(address(zeroFee), type(uint256).max);     // alice 授权新交易所无限额度
        vm.prank(bob);                                          // 将后续调用者设为 bob
        token.approve(address(zeroFee), type(uint256).max);     // bob 授权新交易所无限额度

        vm.prank(alice);                                        // 将后续调用者设为 alice
        zeroFee.depositEther{value: 100 ether}();               // alice 向新交易所存入 100 ETH
        vm.prank(bob);                                          // 将后续调用者设为 bob
        zeroFee.depositToken(address(token), 1000);             // bob 向新交易所存入 1000 枚 KWT

        vm.prank(alice);                                        // 将后续调用者设为 alice
        zeroFee.makeOrder(address(token), 1000, ETHER, 10 ether);   // alice 挂单：想获得 1000 KWT，付出 10 ETH

        vm.prank(bob);                                          // 将后续调用者设为 bob
        zeroFee.fillOrder(1);                                   // bob 吃下订单完成成交（费率为 0）

        assertEq(zeroFee.balanceOf(address(token), bob), 0);    // 断言 bob 付出全部 1000 KWT 后余额为 0
        assertEq(zeroFee.balanceOf(address(token), alice), 1000);   // 断言 alice 获得全部 1000 KWT
        assertEq(zeroFee.balanceOf(ETHER, bob), 10 ether);      // 断言 bob 获得 10 ETH
        assertEq(zeroFee.balanceOf(ETHER, alice), 90 ether);    // 断言 alice 剩余 90 ETH
        // 零费率时手续费账户不变                                                // 说明：费率为 0 时不产生手续费
        assertEq(zeroFee.balanceOf(address(token), feeAccount), 0);  // 断言手续费账户余额仍为 0
    }

    // ---------- 完整交易闭环 ----------                        // 分区注释：以下测试完整的存、交易、取流程

    function test_FullFlow_DepositTradeWithdraw() public {      // 测试完整的存钱、成交、取钱闭环
        // alice 挂单卖 ETH 换 KWT                                            // 说明：挂单方卖 ETH 买 KWT
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.depositEther{value: 100 ether}();              // alice 存入 100 ETH
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);  // alice 挂单：想获得 1000 KWT，付出 10 ETH

        // bob 存 KWT 并吃单                                                     // 说明：吃单方存 KWT 并成交
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.depositToken(address(token), 2000);            // bob 存入 2000 枚 KWT
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.fillOrder(1);                                  // bob 吃下 1 号订单完成成交

        // 双方把各自得到的资产取出                                             // 说明：双方各自提取成交所得资产
        vm.prank(bob);                                          // 将后续调用者设为 bob
        exchange.withdrawEther(10 ether);                       // bob 取出成交所得的 10 ETH
        vm.prank(alice);                                        // 将后续调用者设为 alice
        exchange.withdrawToken(address(token), 1000);           // alice 取出成交所得的 1000 KWT

        assertEq(exchange.balanceOf(ETHER, bob), 0);            // 断言 bob 在交易所的 ETH 余额已取空为 0
        assertEq(exchange.balanceOf(address(token), alice), 0); // 断言 alice 在交易所的 KWT 余额已取空为 0
        assertEq(token.balanceOf(alice), 100_000 + 1000);       // 断言 alice 钱包 KWT = 初始 100000 + 成交所得 1000
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;  // 指定 Solidity 编译器版本：0.8.13 及以上

import {Test, console} from "forge-std/Test.sol";  // 引入 Foundry 测试基类 Test 和调试用的 console
import {Exchange} from "../src/Exchange.sol";  // 引入被测合约 Exchange
import {KerwinToken} from "../src/KerwinToken.sol";  // 引入测试用的 ERC20 代币 KerwinToken

// 专门测试 Exchange 的两个出金方法：withdrawEther 和 withdrawToken  // 本文件整体测试目标说明
contract WithDrawTest is Test {  // 定义测试合约，继承 Foundry 的 Test 基类
    Exchange public exchange;  // 声明被测合约 Exchange 实例
    KerwinToken public token;  // 声明测试用代币 KerwinToken 实例

    address public owner = address(this);  // owner 设为当前测试合约自身地址
    address public alice = makeAddr("alice");  // 用 makeAddr 生成可追溯的 alice 测试地址
    address public bob = makeAddr("bob");  // 生成 bob 测试地址，用于验证"别人不能取我的钱"
    address public feeAccount = makeAddr("feeAccount");  // 生成收费账户 feeAccount 测试地址

    // Exchange 合约里用 address(0) 代表 ETH  // 约定：零地址代表原生币 ETH
    address public constant ETHER = address(0);  // 定义常量 ETHER 为零地址

    uint256 public constant FEE_PERCENT = 10;  // 定义手续费比例常量：10（单位由 Exchange 内部决定）

    // 10 万 KWT：KWT 有 18 位小数，所以要乘以 10^18  // 说明 AMOUNT_KWT 数值的含义
    uint256 public constant AMOUNT_KWT = 100_000 * 10 ** 18;  // 10 万 KWT，换算为最小单位 wei

    // 重新声明 Exchange 里的 Withdraw 事件，测试里才能 emit 它来做事件断言  // 事件重声明原因
    event Withdraw(address token, address user, uint256 amount, uint256 balance);  // 与 Exchange 同名同参数的事件，用于 expectEmit 断言

    function setUp() public {  // 每个测试用例运行前都会执行的初始化函数
        token = new KerwinToken();  // 部署一个新的 KerwinToken 代币合约
        exchange = new Exchange(feeAccount, FEE_PERCENT);  // 部署 Exchange 合约，传入收费账户和费率

        // 给 alice 和 bob 各转 10 万 KWT  // 初始化：向两个测试账号发放代币
        token.transfer(alice, AMOUNT_KWT);  // 从部署者（本合约）向 alice 转账 10 万 KWT
        token.transfer(bob, AMOUNT_KWT);  // 从部署者（本合约）向 bob 转账 10 万 KWT

        // alice 和 bob 授权交易所调用 transferFrom  // 授权说明
        vm.prank(alice);  // 让接下来的调用以 alice 身份发起
        token.approve(address(exchange), type(uint256).max);  // alice 无限额授权 Exchange 支配其代币
        vm.prank(bob);  // 让接下来的调用以 bob 身份发起
        token.approve(address(exchange), type(uint256).max);  // bob 无限额授权 Exchange 支配其代币

        // 给 alice 和 bob 一些 ETH，供 depositEther 使用  // 初始化：给测试账号充值原生币
        vm.deal(alice, 100 ether);  // 直接给 alice 账户写入 100 ETH 余额
        vm.deal(bob, 100 ether);  // 直接给 bob 账户写入 100 ETH 余额
    }

    // ---------- withdrawEther ----------  // 分隔线：下面测试 withdrawEther 方法

    function test_WithdrawEther() public {  // 测试：正常取出 ETH
        uint256 depositAmount = 10 ether;  // 先存入 10 ETH
        uint256 withdrawAmount = 4 ether;  // 本次取回 4 ETH

        // 先让 alice 存入 10 ETH，交易所才有的取  // 准备前提：存款
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositEther{value: depositAmount}();  // alice 存入 10 ETH

        vm.expectEmit(true, true, true, true);  // 断言接下来会发出符合预期的事件（四个 true 表示校验四个数据字段）
        emit Withdraw(ETHER, alice, withdrawAmount, depositAmount - withdrawAmount);  // 先声明期望的事件：ETH、alice、取 4、剩 6

        uint256 before = alice.balance;  // 记录 alice 提现前的钱包 ETH 余额
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.withdrawEther(withdrawAmount);  // alice 从交易所取回 4 ETH
        uint256 afterBalance = alice.balance;  // 记录 alice 提现后的钱包 ETH 余额

        // 交易所内部记账：alice 的 ETH 从 10 变成 6  // 说明第一条断言含义
        assertEq(exchange.balanceOf(ETHER, alice), depositAmount - withdrawAmount);  // 断言 alice 在交易所的 ETH 记账为 6 ETH
        // alice 钱包实际收到 4 ETH  // 说明第二条断言含义
        assertEq(afterBalance - before, withdrawAmount);  // 断言 alice 钱包余额增加了 4 ETH
        // 交易所合约实际 ETH 减少为 6 ETH  // 说明第三条断言含义
        assertEq(address(exchange).balance, depositAmount - withdrawAmount);  // 断言交易所合约持有的 ETH 变为 6 ETH
    }

    function test_WithdrawEther_PartialWithdrawKeepsRemainder() public {  // 测试：部分取款后，剩余余额仍可继续取
        vm.startPrank(alice);  // 开始以 alice 身份执行后续所有调用
        exchange.depositEther{value: 10 ether}();  // 存入 10 ETH
        exchange.withdrawEther(3 ether);  // 第一次取 3 ETH，剩 7 ETH
        exchange.withdrawEther(5 ether);  // 第二次取 5 ETH，剩 2 ETH
        vm.stopPrank();  // 结束 alice 身份模拟

        assertEq(exchange.balanceOf(ETHER, alice), 2 ether);  // 断言两次取款后还剩 2 ETH
    }

    function test_WithdrawEther_RevertWhenInsufficient() public {  // 测试：余额不足时取 ETH 应回滚
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositEther{value: 1 ether}();  // alice 只存入 1 ETH

        vm.prank(alice);  // 以 alice 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawEther(2 ether);  // 尝试取 2 ETH（超过 1 ETH 余额）应触发 revert
    }

    function test_WithdrawEther_RevertWhenNoDeposit() public {  // 测试：从未存款时取 ETH 应回滚
        vm.prank(alice);  // 以 alice 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawEther(1 ether);  // alice 在交易所没有 ETH 记账，取款应失败
    }

    // ---------- withdrawToken ----------  // 分隔线：下面测试 withdrawToken 方法

    function test_WithdrawToken() public {  // 测试：正常取出 ERC20 代币
        uint256 depositAmount = 10_000 * 10 ** 18;  // 先存入 1 万 KWT
        uint256 withdrawAmount = 4_000 * 10 ** 18;  // 本次取回 4000 KWT

        // 先让 alice 存入 1 万 KWT  // 准备前提：存款
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositToken(address(token), depositAmount);  // alice 存入 1 万 KWT

        vm.expectEmit(true, true, true, true);  // 断言接下来会发出符合预期的事件
        emit Withdraw(address(token), alice, withdrawAmount, depositAmount - withdrawAmount);  // 声明期望事件：token、alice、取 4000、剩 6000

        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.withdrawToken(address(token), withdrawAmount);  // alice 从交易所取回 4000 KWT

        // 交易所内部记账：alice 名下从 1 万变成 6000 KWT  // 说明第一条断言含义
        assertEq(exchange.balanceOf(address(token), alice), depositAmount - withdrawAmount);  // 断言 alice 在交易所的 KWT 记账为 6000
        // KWT 真的回到了 alice 钱包：10 万 - 1 万(已存) + 4000(取回)  // 说明第二条断言含义
        assertEq(token.balanceOf(alice), AMOUNT_KWT - depositAmount + withdrawAmount);  // 断言 alice 的代币钱包余额正确
        // 交易所合约持有的 KWT 相应减少为 6000  // 说明第三条断言含义
        assertEq(token.balanceOf(address(exchange)), depositAmount - withdrawAmount);  // 断言交易所合约实际只持有 6000 KWT
    }

    function test_WithdrawToken_RevertWhenInsufficient() public {  // 测试：余额不足时取代币应回滚
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositToken(address(token), 100);  // alice 只存入 100 KWT

        vm.prank(alice);  // 以 alice 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawToken(address(token), 101);  // 尝试取 101 KWT（超过 100 余额）应触发 revert
    }

    function test_WithdrawToken_RevertWhenTokenIsEther() public {  // 测试：把 ETH（零地址）当 token 传给 withdrawToken 应回滚
        vm.prank(alice);  // 以 alice 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawToken(ETHER, 100);  // 传入零地址作为 token 应触发 require(_token != ETHER) 回滚
    }

    // ---------- 隔离性：不能取别人的钱 ----------  // 分隔线：验证账户隔离

    function test_WithdrawEther_CannotWithdrawOthers() public {  // 测试：bob 不能取走 alice 存入的 ETH
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositEther{value: 10 ether}();  // alice 存入 10 ETH

        vm.prank(bob);  // 以 bob 身份发起调用（bob 在交易所没有 ETH 记账）
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawEther(1 ether);  // bob 尝试取 1 ETH 应失败
    }

    function test_WithdrawToken_CannotWithdrawOthers() public {  // 测试：bob 不能取走 alice 存入的 KWT
        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositToken(address(token), 5000 * 10 ** 18);  // alice 存入 5000 KWT

        vm.prank(bob);  // 以 bob 身份发起调用（bob 在交易所没有 KWT 记账）
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.withdrawToken(address(token), 1000 * 10 ** 18);  // bob 尝试取 1000 KWT 应失败
    }
}

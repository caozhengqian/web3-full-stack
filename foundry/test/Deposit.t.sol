// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;  // 指定 Solidity 编译器版本：0.8.13 及以上

import {Test, console} from "forge-std/Test.sol";  // 引入 Foundry 测试基类 Test 和调试用的 console
import {Exchange} from "../src/Exchange.sol";  // 引入被测合约 Exchange
import {KerwinToken} from "../src/KerwinToken.sol";  // 引入测试用的 ERC20 代币 KerwinToken

// 专门测试 Exchange 的两个入金方法：depositEther 和 depositToken  // 本文件整体测试目标说明
contract DepositTest is Test {  // 定义测试合约，继承 Foundry 的 Test 基类
    Exchange public exchange;  // 声明被测合约 Exchange 实例
    KerwinToken public token;  // 声明测试用代币 KerwinToken 实例

    address public owner = address(this);  // owner 设为当前测试合约自身地址
    address public alice = makeAddr("alice");  // 用 makeAddr 生成可追溯的 alice 测试地址
    address public feeAccount = makeAddr("feeAccount");  // 生成收费账户 feeAccount 测试地址

    // Exchange 合约里用 address(0) 代表 ETH  // 约定：零地址代表原生币 ETH
    address public constant ETHER = address(0);  // 定义常量 ETHER 为零地址

    uint256 public constant FEE_PERCENT = 10;  // 定义手续费比例常量：10（单位由 Exchange 内部决定）

    // 10 万 KWT：KWT 有 18 位小数，所以要乘以 10^18  // 说明 AMOUNT_KWT 数值的含义
    uint256 public constant AMOUNT_KWT = 100_000 * 10 ** 18;  // 10 万 KWT，换算为最小单位 wei

    // 重新声明 Exchange 里的 Deposit 事件，测试里才能 emit 它来做事件断言  // 事件重声明原因
    event Deposit(address token, address user, uint256 amount, uint256 balance);  // 与 Exchange 同名同参数的事件，用于 expectEmit 断言

    function setUp() public {  // 每个测试用例运行前都会执行的初始化函数
        token = new KerwinToken();  // 部署一个新的 KerwinToken 代币合约
        exchange = new Exchange(feeAccount, FEE_PERCENT);  // 部署 Exchange 合约，传入收费账户和费率

        // 给 alice 转 10 万 KWT  // 初始化：向 alice 发放代币
        token.transfer(alice, AMOUNT_KWT);  // 从部署者（本合约）向 alice 转账 10 万 KWT

        // alice 授权交易所调用 transferFrom  // 授权说明
        vm.prank(alice);  // 让接下来的调用以 alice 身份发起
        token.approve(address(exchange), type(uint256).max);  // alice 无限额授权 Exchange 支配其代币

        // 给 alice 一些 ETH，供 depositEther 使用  // 初始化：给 alice 充值原生币
        vm.deal(alice, 100 ether);  // 直接给 alice 账户写入 100 ETH 余额
    }

    // ---------- depositEther ----------  // 分隔线：下面测试 depositEther 方法

    function test_DepositEther() public {  // 测试：正常存入 ETH
        uint256 amount = 10 ether;  // 本次存入金额：10 ETH

        vm.expectEmit(true, true, true, true);  // 断言接下来会发出符合预期的事件（四个 true 表示校验四个 indexed/数据字段）
        emit Deposit(ETHER, alice, amount, amount);  // 先声明期望的事件内容

        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositEther{value: amount}();  // alice 调用 depositEther 并附带 10 ETH

        assertEq(exchange.balanceOf(ETHER, alice), amount);  // 断言 alice 在交易所的 ETH 记账为 10 ETH
        assertEq(address(exchange).balance, amount);  // 断言交易所合约实际收到 10 ETH
    }

    function test_DepositEther_MultipleDepositsAccumulate() public {  // 测试：多次存入 ETH 应累加
        vm.startPrank(alice);  // 开始以 alice 身份执行后续所有调用
        exchange.depositEther{value: 3 ether}();  // 第一次存入 3 ETH
        exchange.depositEther{value: 2 ether}();  // 第二次存入 2 ETH
        vm.stopPrank();  // 结束 alice 身份模拟

        assertEq(exchange.balanceOf(ETHER, alice), 5 ether);  // 断言两次存款累加为 5 ETH
    }

    // ---------- depositToken ----------  // 分隔线：下面测试 depositToken 方法

    function test_DepositToken() public {  // 测试：正常存入 ERC20 代币
        vm.expectEmit(true, true, true, true);  // 断言接下来会发出符合预期的事件
        emit Deposit(address(token), alice, AMOUNT_KWT, AMOUNT_KWT);  // 声明期望的事件：token、alice、10 万 KWT

        vm.prank(alice);  // 以 alice 身份发起调用
        exchange.depositToken(address(token), AMOUNT_KWT);  // alice 向交易所存入 10 万 KWT

        // 交易所内部记账：alice 名下有 10 万 KWT  // 说明第一条断言含义
        assertEq(exchange.balanceOf(address(token), alice), AMOUNT_KWT);  // 断言交易所为 alice 记账 10 万 KWT
        // KWT 真的转进了交易所合约地址  // 说明第二条断言含义
        assertEq(token.balanceOf(address(exchange)), AMOUNT_KWT);  // 断言交易所合约实际持有 10 万 KWT
        // alice 自己账户里被扣掉 10 万 KWT  // 说明第三条断言含义
        assertEq(token.balanceOf(alice), 0);  // 断言 alice 的代币余额被清零
    }

    function test_DepositToken_RevertWhenTokenIsEther() public {  // 测试：用 ETH（零地址）调用 depositToken 应回滚
        vm.prank(alice);  // 以 alice 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.depositToken(ETHER, AMOUNT_KWT);  // 传入零地址作为 token 应触发 revert
    }

    function test_DepositToken_RevertWithoutApproval() public {  // 测试：未授权时存款应回滚
        // charlie 有币但没授权交易所  // 说明测试前提
        address charlie = makeAddr("charlie");  // 生成 charlie 测试地址
        token.transfer(charlie, AMOUNT_KWT);  // 向 charlie 转账 10 万 KWT（但不授权）

        vm.prank(charlie);  // 以 charlie 身份发起调用
        vm.expectRevert();  // 断言下一次调用会回滚
        exchange.depositToken(address(token), AMOUNT_KWT);  // 未授权的 transferFrom 将失败并回滚
    }
}

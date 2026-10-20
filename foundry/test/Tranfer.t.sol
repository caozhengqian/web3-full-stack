// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {KerwinToken} from "../src/KerwinToken.sol";

// 测试合约：继承 Test，获得 vm（虚拟环境）、assertEq 等断言工具
contract TranferTest is Test {
    // 声明一个 KerwinToken 类型的变量，setUp 里会 new 出真实合约实例
    KerwinToken public token;

    // 用固定的假地址代表不同角色，方便测试时区分"谁在操作"
    address public owner = address(this);   // owner 用当前测试合约的地址模拟（部署者）
    address public alice = address(0x1);    // alice 用一个占位地址 0x1 模拟收款方
    address public bob = address(0x2);      // bob 用占位地址 0x2 模拟另一个收款方

    // 记录初始总供应量：1_000_000 个币，每个币有 18 位小数，所以乘以 10^18
    // 1_000_000 * 10**18 = 10^24，这样写和合约里的 totalSupply 保持一致
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    // 重新声明合约里定义的 Transfer 事件，这样测试里才能 emit 它来做事件断言
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // setUp：每个测试函数执行之前都会先自动运行一次，用来准备测试环境
    function setUp() public {
        // 部署一个新的 KerwinToken 合约实例，赋值给 token
        // 部署时合约的 constructor 会把全部 token 都发给 msg.sender（也就是这里的测试合约地址 owner）
        token = new KerwinToken();
    }

    // 辅助函数：把 owner、alice、bob 三个账号的当前余额一次性打印到控制台
    // 每当有账号余额发生变动，就调用它一次，方便观察余额变化过程
    function _logBalances() internal view {
        // Solidity 的普通字符串只支持 ASCII，要打印中文必须加 unicode 前缀
        console.log(unicode"======== 当前余额 ========");      // 打印一条分隔线，方便看清每段输出
        console.log("owner :", token.balanceOf(owner));       // 打印 owner（主账号）的余额
        console.log("alice :", token.balanceOf(alice));       // 打印 alice 的余额
        console.log("bob   :", token.balanceOf(bob));         // 打印 bob 的余额
    }

    // ----------------------- 正常转账 -----------------------

    // 测试用例 1：正常调用 transfer，验证返回值、余额变化和事件日志
    function test_Transfer() public {
        // 本次要转账的金额：1000 个币（注意乘以 10^18 补上 18 位小数）
        uint256 amount = 1000 * 10 ** 18;

        // 转账前先打印一次，作为"初始快照"，此时 owner 持有全部 token
        _logBalances();

        // vm.expectEmit：断言"下一次调用会触发一个特定的事件日志"
        // 四个 true 参数依次表示：是否检查第 1/2/3 个 indexed 字段、是否检查未 indexed 的数据
        // 这里全 true 表示四个字段都要精确匹配
        vm.expectEmit(true, true, true, true);
        // 手动 emit 一次预期的事件，Foundry 会用它的内容和接下来真实调用产生的事件逐字段比对
        emit Transfer(owner, alice, amount);

        // 真正调用 transfer：owner（部署者）给 alice 转 amount
        // 返回布尔值表示是否成功，用 ok 接住
        bool ok = token.transfer(alice, amount);

        // assertTrue：断言 ok 等于 true，即转账函数返回成功
        assertTrue(ok);
        // assertEq：断言 owner 余额 = 初始总量 - 已转出金额（说明扣款正确）
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        // 断言 alice 余额 = amount（说明收款正确）
        assertEq(token.balanceOf(alice), amount);

        // 转账后再打印一次，可以清楚看到：owner 减少、alice 增加
        _logBalances();
    }

    // 测试用例 2：连续转账，展示 owner / alice / bob 三个账号余额依次变动
    function test_TransferToAliceAndBob() public {
        // 定义两笔不同的转账金额
        uint256 toAlice = 500 * 10 ** 18;   // 第一笔：转给 alice 500 个币
        uint256 toBob = 200 * 10 ** 18;     // 第二笔：转给 bob 200 个币

        // 初始快照：此时只有 owner 有余额
        _logBalances();

        // 第一笔转账：owner -> alice，alice 余额发生变化
        token.transfer(alice, toAlice);
        _logBalances();                     // 打印一次，能看到 alice 从 0 变成 toAlice

        // 第二笔转账：owner -> bob，bob 余额发生变化
        token.transfer(bob, toBob);
        _logBalances();                     // 打印一次，能看到 bob 从 0 变成 toBob

        // 断言三个账号的最终余额都正确
        assertEq(token.balanceOf(alice), toAlice);                              // alice 收到 toAlice
        assertEq(token.balanceOf(bob), toBob);                                  // bob 收到 toBob
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - toAlice - toBob);     // owner 被扣掉两笔
    }

    // ----------------------- 异常情况 -----------------------

    // 测试用例 3：向零地址转账必须回滚（合约里 require(_to != address(0)) 会拦截）
    function test_TransferToZeroAddress() public {
        // vm.expectRevert：断言"下一次调用必须 revert（回滚）"，否则测试失败
        vm.expectRevert();
        // 尝试给 address(0)（零地址）转 100，预期这行会触发 revert 被上面拦截
        token.transfer(address(0), 100);
    }

    // 测试用例 4：余额不足时转账必须回滚（_tranfer 里 require(balanceOf[_from] >= _value) 会拦截）
    function test_TransferInsufficientBalance() public {
        // 断言下一次调用会 revert
        vm.expectRevert();
        // 尝试转出超过余额的金额（INITIAL_SUPPLY + 1），owner 只有 INITIAL_SUPPLY，所以一定失败
        token.transfer(alice, INITIAL_SUPPLY + 1);
    }

    // ----------------------- 模糊测试 -----------------------

    // 测试用例 5：模糊测试（Fuzz），Foundry 会随机生成大量 amount 值反复执行这个函数
    function testFuzz_Transfer(uint256 amount) public {
        // vm.assume：过滤掉不满足条件的随机值，只保留 0 < amount <= 总供应量 的合法范围
        // 这样既能覆盖各种金额，又避免余额不足或为零导致无意义回滚
        vm.assume(amount > 0 && amount <= INITIAL_SUPPLY);

        // 在合法范围内执行转账
        token.transfer(alice, amount);

        // 断言 alice 收到 amount（收款正确）
        assertEq(token.balanceOf(alice), amount);
        // 断言 owner 余额 = 总量 - amount（扣款正确）
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);

        // 注意：模糊测试默认会运行 256 次，这里故意不调用 _logBalances()
        // 否则控制台会打印 256 组余额造成刷屏；如果想看，可以临时加回 _logBalances()
    }
}

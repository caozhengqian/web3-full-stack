// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Exchange} from "../src/Exchange.sol";
import {KerwinToken} from "../src/KerwinToken.sol";

contract ExchangeTest is Test {
    Exchange public exchange;
    KerwinToken public token;

    address public owner = address(this);
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public feeAccount = makeAddr("feeAccount");

    // Exchange 合约里用 address(0) 代表 ETH
    address public constant ETHER = address(0);

    uint256 public constant FEE_PERCENT = 10;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    function setUp() public {
        token = new KerwinToken();
        exchange = new Exchange(feeAccount, FEE_PERCENT);

        // 给 alice 和 bob 分一些 KWT
        token.transfer(alice, 100_000);
        token.transfer(bob, 100_000);

        // 授权交易所调用 transferFrom
        vm.prank(alice);
        token.approve(address(exchange), type(uint256).max);
        vm.prank(bob);
        token.approve(address(exchange), type(uint256).max);

        // 给 alice 和 bob 一些 ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);

        // 固定时间戳，方便断言订单相关事件
        vm.warp(1_000_000);
    }

    // ---------- 构造器 / 初始状态 ----------

    function test_Constructor() public view {
        assertEq(exchange.feeAccout(), feeAccount);
        assertEq(exchange.feePercent(), FEE_PERCENT);
    }

    // ---------- depositEther ----------

    function test_DepositEther() public {
        vm.expectEmit(true, true, true, true);
        emit Deposit(ETHER, alice, 10 ether, 10 ether);

        vm.prank(alice);
        exchange.depositEther{value: 10 ether}();

        assertEq(exchange.balanceOf(ETHER, alice), 10 ether);
        assertEq(address(exchange).balance, 10 ether);
    }

    function test_DepositEther_MultipleDepositsAccumulate() public {
        vm.startPrank(alice);
        exchange.depositEther{value: 3 ether}();
        exchange.depositEther{value: 2 ether}();
        vm.stopPrank();

        assertEq(exchange.balanceOf(ETHER, alice), 5 ether);
    }

    // ---------- depositToken ----------

    function test_DepositToken() public {
        uint256 amount = 1000;

        vm.expectEmit(true, true, true, true);
        emit Deposit(address(token), alice, amount, amount);

        vm.prank(alice);
        exchange.depositToken(address(token), amount);

        assertEq(exchange.balanceOf(address(token), alice), amount);
        assertEq(token.balanceOf(address(exchange)), amount);
    }

    function test_DepositToken_RevertWhenTokenIsEther() public {
        vm.prank(alice);
        vm.expectRevert();
        exchange.depositToken(ETHER, 1000);
    }

    function test_DepositToken_RevertWithoutApproval() public {
        // 未授权的账号 charlie
        address charlie = makeAddr("charlie");
        token.transfer(charlie, 1000);

        vm.prank(charlie);
        vm.expectRevert();
        exchange.depositToken(address(token), 1000);
    }

    // ---------- withdrawEther ----------

    function test_WithdrawEther() public {
        vm.prank(alice);
        exchange.depositEther{value: 10 ether}();

        vm.expectEmit(true, true, true, true);
        emit Withdraw(ETHER, alice, 4 ether, 6 ether);

        uint256 before = alice.balance;
        vm.prank(alice);
        exchange.withdrawEther(4 ether);
        uint256 after_ = alice.balance;

        assertEq(exchange.balanceOf(ETHER, alice), 6 ether);
        assertEq(after_ - before, 4 ether);
    }

    function test_WithdrawEther_RevertWhenInsufficient() public {
        vm.prank(alice);
        exchange.depositEther{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert();
        exchange.withdrawEther(2 ether);
    }

    // ---------- withdrawToken ----------

    function test_WithdrawToken() public {
        uint256 amount = 1000;

        vm.prank(alice);
        exchange.depositToken(address(token), amount);

        vm.expectEmit(true, true, true, true);
        emit Withdraw(address(token), alice, 400, 600);

        vm.prank(alice);
        exchange.withdrawToken(address(token), 400);

        assertEq(exchange.balanceOf(address(token), alice), 600);
        assertEq(token.balanceOf(alice), 100_000 - amount + 400);
    }

    function test_WithdrawToken_RevertWhenInsufficient() public {
        vm.prank(alice);
        exchange.depositToken(address(token), 100);

        vm.prank(alice);
        vm.expectRevert();
        exchange.withdrawToken(address(token), 101);
    }

    function test_WithdrawToken_RevertWhenTokenIsEther() public {
        vm.prank(alice);
        vm.expectRevert();
        exchange.withdrawToken(ETHER, 100);
    }

    // ---------- balanceOf ----------

    function test_BalanceOf_DefaultZero() public view {
        assertEq(exchange.balanceOf(ETHER, alice), 0);
        assertEq(exchange.balanceOf(address(token), bob), 0);
    }

    // ---------- makeOrder ----------

    function test_MakeOrder() public {
        // alice 存 100 ETH
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();

        vm.expectEmit(true, true, true, true);
        emit Order(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);

        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);

        assertEq(exchange.orderCount(), 1);
        (uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive,) =
            exchange.orders(1);
        assertEq(id, 1);
        assertEq(user, alice);
        assertEq(tokenGet, address(token));
        assertEq(amountGet, 1000);
        assertEq(tokenGive, ETHER);
        assertEq(amountGive, 10 ether);
    }

    function test_MakeOrder_RevertWhenInsufficientGiveBalance() public {
        // alice 只有 1 ETH，但想挂 10 ETH 的卖单
        vm.prank(alice);
        exchange.depositEther{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert(unicode"创建订单的余额不足");
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);
    }

    function test_MakeOrder_IncrementsOrderCount() public {
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();

        vm.startPrank(alice);
        exchange.makeOrder(address(token), 100, ETHER, 1 ether);
        exchange.makeOrder(address(token), 200, ETHER, 2 ether);
        vm.stopPrank();

        assertEq(exchange.orderCount(), 2);
    }

    // ---------- cancelOrder ----------

    function test_CancelOrder() public {
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();

        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);

        vm.expectEmit(true, true, true, true);
        emit Cancel(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);

        vm.prank(alice);
        exchange.cancelOrder(1);

        assertTrue(exchange.orderCancel(1));
    }

    function test_CancelOrder_RevertWhenNonExistent() public {
        vm.expectRevert();
        exchange.cancelOrder(999);
    }

    // ---------- fillOrder ----------

    function test_FillOrder() public {
        // alice 存 100 ETH（挂单方，出 ETH）
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();
        // bob 存 2000 KWT（吃单方，出 KWT）
        vm.prank(bob);
        exchange.depositToken(address(token), 2000);

        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);

        vm.expectEmit(true, true, true, true);
        emit Trade(1, alice, address(token), 1000, ETHER, 10 ether, 1_000_000);

        vm.prank(bob);
        exchange.fillOrder(1);

        // 手续费 = amountGet * feePercent / 100 = 1000 * 10 / 100 = 100 KWT
        // bob 出 1000 + 100 = 1100 KWT，得 10 ETH
        assertEq(exchange.balanceOf(address(token), bob), 2000 - 1100); // 900
        // 手续费进入 feeAccount
        assertEq(exchange.balanceOf(address(token), feeAccount), 100);
        // alice 得 1000 KWT
        assertEq(exchange.balanceOf(address(token), alice), 1000);
        // bob 得 10 ETH
        assertEq(exchange.balanceOf(ETHER, bob), 10 ether);
        // alice 出 10 ETH
        assertEq(exchange.balanceOf(ETHER, alice), 90 ether);

        assertTrue(exchange.orderFill(1));
    }

    function test_FillOrder_RevertWhenNonExistent() public {
        vm.prank(bob);
        vm.expectRevert();
        exchange.fillOrder(999);
    }

    function test_FillOrder_RevertWhenMakerGiveInsufficient() public {
        // alice 挂 10 ETH 卖单后，把 ETH 全部取走
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();
        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);
        vm.prank(alice);
        exchange.withdrawEther(95 ether); // 剩 5 ETH，不足 10 ETH

        // bob 有足够的 KWT
        vm.prank(bob);
        exchange.depositToken(address(token), 2000);

        vm.prank(bob);
        vm.expectRevert(unicode"创建者的give余额不足");
        exchange.fillOrder(1);
    }

    function test_FillOrder_RevertWhenTakerGetInsufficient() public {
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();
        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);

        // bob 只有 1000 KWT，但需要 1000 + 100(手续费) = 1100 KWT
        vm.prank(bob);
        exchange.depositToken(address(token), 1000);

        vm.prank(bob);
        vm.expectRevert(unicode"购买者的get+“小费”余额不足");
        exchange.fillOrder(1);
    }

    function test_FillOrder_ZeroFee() public {
        // 单独部署一个费率为 0 的交易所
        Exchange zeroFee = new Exchange(feeAccount, 0);
        vm.prank(alice);
        token.approve(address(zeroFee), type(uint256).max);
        vm.prank(bob);
        token.approve(address(zeroFee), type(uint256).max);

        vm.prank(alice);
        zeroFee.depositEther{value: 100 ether}();
        vm.prank(bob);
        zeroFee.depositToken(address(token), 1000);

        vm.prank(alice);
        zeroFee.makeOrder(address(token), 1000, ETHER, 10 ether);

        vm.prank(bob);
        zeroFee.fillOrder(1);

        assertEq(zeroFee.balanceOf(address(token), bob), 0);
        assertEq(zeroFee.balanceOf(address(token), alice), 1000);
        assertEq(zeroFee.balanceOf(ETHER, bob), 10 ether);
        assertEq(zeroFee.balanceOf(ETHER, alice), 90 ether);
        // 零费率时手续费账户不变
        assertEq(zeroFee.balanceOf(address(token), feeAccount), 0);
    }

    // ---------- 完整交易闭环 ----------

    function test_FullFlow_DepositTradeWithdraw() public {
        // alice 挂单卖 ETH 换 KWT
        vm.prank(alice);
        exchange.depositEther{value: 100 ether}();
        vm.prank(alice);
        exchange.makeOrder(address(token), 1000, ETHER, 10 ether);

        // bob 存 KWT 并吃单
        vm.prank(bob);
        exchange.depositToken(address(token), 2000);
        vm.prank(bob);
        exchange.fillOrder(1);

        // 双方把各自得到的资产取出
        vm.prank(bob);
        exchange.withdrawEther(10 ether);
        vm.prank(alice);
        exchange.withdrawToken(address(token), 1000);

        assertEq(exchange.balanceOf(ETHER, bob), 0);
        assertEq(exchange.balanceOf(address(token), alice), 0);
        assertEq(token.balanceOf(alice), 100_000 + 1000);
    }
}

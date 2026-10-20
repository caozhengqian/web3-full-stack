// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {KerwinToken} from "../src/KerwinToken.sol";

contract KerwinTokenTest is Test {
    KerwinToken public token;

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public spender = address(0x3);

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18; // 1e24

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function setUp() public {
        token = new KerwinToken();
    }

    // ---------- 构造器 / 初始状态 ----------

    function test_InitialState() public view {
        assertEq(token.name(), "KerwinToken");
        assertEq(token.symbol(), "KWT");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    // ---------- transfer ----------

    function test_Transfer() public {
        uint256 amount = 1000 * 10 ** 18;

        vm.expectEmit(true, true, true, true);
        emit Transfer(owner, alice, amount);

        bool ok = token.transfer(alice, amount);

        assertTrue(ok);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(alice), amount);
    }

    function test_TransferToZeroAddress() public {
        vm.expectRevert();
        token.transfer(address(0), 100);
    }

    function test_TransferInsufficientBalance() public {
        vm.expectRevert();
        token.transfer(alice, INITIAL_SUPPLY + 1);
    }

    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount > 0 && amount <= INITIAL_SUPPLY);

        token.transfer(alice, amount);

        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    // ---------- approve ----------

    function test_Approve() public {
        uint256 amount = 500 * 10 ** 18;

        vm.expectEmit(true, true, true, true);
        emit Approval(owner, spender, amount);

        bool ok = token.approve(spender, amount);

        assertTrue(ok);
        assertEq(token.allowance(owner, spender), amount);
    }

    function test_ApproveZeroAddress() public {
        vm.expectRevert();
        token.approve(address(0), 100);
    }

    function test_ApproveOverwritesPreviousAllowance() public {
        token.approve(spender, 100);
        token.approve(spender, 200);
        assertEq(token.allowance(owner, spender), 200);
    }

    function testFuzz_Approve(uint256 amount) public {
        bool ok = token.approve(spender, amount);
        assertTrue(ok);
        assertEq(token.allowance(owner, spender), amount);
    }

    // ---------- transferFrom ----------

    function test_TransferFrom() public {
        uint256 allowance = 1000 * 10 ** 18;
        uint256 amount = 300 * 10 ** 18;

        token.approve(spender, allowance);

        vm.expectEmit(true, true, true, true);
        emit Transfer(owner, bob, amount);

        vm.prank(spender);
        bool ok = token.transferFrom(owner, bob, amount);

        assertTrue(ok);
        assertEq(token.balanceOf(bob), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        // 授权额度被扣减
        assertEq(token.allowance(owner, spender), allowance - amount);
    }

    function test_TransferFromInsufficientBalance() public {
        uint256 allowance = INITIAL_SUPPLY + 1;
        token.approve(spender, allowance);

        vm.prank(spender);
        vm.expectRevert();
        token.transferFrom(owner, bob, allowance);
    }

    function test_TransferFromInsufficientAllowance() public {
        token.approve(spender, 100);

        vm.prank(spender);
        vm.expectRevert();
        token.transferFrom(owner, bob, 101);
    }

    function test_TransferFromWithoutAllowance() public {
        vm.prank(spender);
        vm.expectRevert();
        token.transferFrom(owner, bob, 1);
    }
}

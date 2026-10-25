// SPDX-License-Identifier: MIT
// SPDX-License-Identifier GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
//KWT币
contract KerwinToken{
    using SafeMath for uint256;
    string public name = "KerwinToken";
    string public symbol = "KWT";//符号（简称）
    uint256 public decimals = 18;//单位：1 KerwinToken = 10**18次方
    uint256 public totalSupply ;//总供应量
    mapping(address=>uint256) public balanceOf;//用户=>余额
    mapping(address =>mapping(address=>uint256))public allowance;// 将币授权给交易所，结构为：{用户账号:{币安:1000，A交易所:2000}}
    constructor(){
      totalSupply = 1000001*(10**decimals);
      balanceOf[msg.sender] = totalSupply;
    }
    // 第一步：转移金额函数
    function _tranfer(address _from,address _to, uint256 _value)internal {
        require(balanceOf[_from]>=_value);
        //从哪个账号发起的调用者
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }
    // 第二步：主账号朝别的账号转移金额
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to!=address(0));//判断是否有效的账户地址
        _tranfer(msg.sender,_to,_value);
        return true;
    }
    // 第三步：使用event在链上存储日志
    event Transfer(address indexed _from,address indexed _to,uint256 _value);
    // 第四步：增加授权函数，可向各大交易所授权
    //        msg.sender 当前网页的登录账号;
    //        _spender：交易所的账号地址；
    //        _value：授权交易所的金额；
    function approve(address _spender, uint256 _value)public returns(bool success){
        require(_spender!=address(0));
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }
    // 第五步：使用event记录链上日志：授权第三方
    event Approval(address indexed _owner,address indexed _spender,uint256 _value);
    // 第六步：交易所使用的转账方法
    //  _from： 放款账号
    //  _to： 收款账号
    //  msg.sender：交易所账户地址
    function transferFrom(address _from,address _to, uint256 _value)public returns (bool success){
        require(balanceOf[_from]>=_value);
        require(allowance[_from][msg.sender]>=_value);
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _tranfer(_from, _to, _value);
        return true;
    }
}
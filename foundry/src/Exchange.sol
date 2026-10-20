// SPDX-License-Identifier: MIT
// SPDX-License-Identifier GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./KerwinToken.sol";
//KWT币
contract Exchange{
    using SafeMath for uint256;
    address public feeAccout ;//收费账号地址
    uint256 public feePercent;//收费费率
    address constant ETHER = address(0);//可以任意值，address(0)表示ether的值就行，给tokens当key
    //交易所存储的各种币。{"ETH"=>{A:100,B:200},"KWT"=>{A:100,B:200}...}
    //因为ETH和KWT容易忘记，可用ETH和KWT的唯一address作为key
    //交易所核心数据！！！
    mapping(address=> mapping(address=>uint256)) public tokens;
    // 游泳池单个结构(币种兑换的订单池)，第十四步使用3-1
    struct _Order{
        uint256 id;
        address user;//创建订单的用户
        address tokenGet;//KWT币地址
        uint256 amountGet;//用KWT数量
        address tokenGive;//用KWT兑换x币的地址
        uint256 amountGive;//用KWT队员x币的数量
        uint256 timestamp;//时间戳
    }
    mapping(uint256=>_Order) public orders;//订单合集，第十四步使用3-3
    uint256 public orderCount;//每一次创建订单都会+1，第十四步使用3-3
    mapping(uint256=>bool) public orderCancel;//取消的订单合集，第十六步使用
    mapping(uint256=>bool) public orderFill;//完成的订单合集，第十八步使用
    constructor(address _feeAccount,uint256 _feePercent){
        feeAccout = _feeAccount;
        feePercent =_feePercent;
    }
    //第七步：往合约地址存以太币
    function depositEther() payable public{
        //交易所存储的各种币。{"ETH"=>{A:100,B:200},"KWT"=>{A:100,B:200}...}
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER,msg.sender, msg.value, tokens[ETHER][msg.sender]);
     }
    // 第八步：上链：往合约地址存以太币
    event Deposit(address token,address user,uint256 amount,uint256 balance);
    // 第九步：往合约地址存其他币
    function depositToken(address _token,uint256 _amount) public{
        require(_token!=ETHER);
        require(KerwinToken(_token).transferFrom(msg.sender,address(this),_amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token,msg.sender, _amount, tokens[_token][msg.sender]);
    }
    // 第十步：从交易所(合约地址)取以太币
    function withdrawEther(uint256 _amount) public{
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER,msg.sender,_amount,tokens[ETHER][msg.sender]);
    }
    // 第十一步：上链：从交易所(合约地址)取以太币
    event Withdraw(address token,address user,uint256 amount,uint256 balance);
    // 第十二步：从交易所(合约地址)取其他币
    function withdrawToken(address _token,uint256 _amount) public{
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        // 当前msg.sender是登录账号，KerwinToken.transfer中的msg.sender是合约Exchange本身地址
        require(KerwinToken(_token).transfer(msg.sender,_amount));
        emit Withdraw(_token,msg.sender,_amount,tokens[_token][msg.sender]);
    }
    // 第十三步：增加查看交易所余额的接口
    function balanceOf(address _token, address _user) public view returns (uint256){
       return tokens[_token][_user];
    }
    // 第十四步：创建单个订单
    function makeOrder(address _tokenGet,uint256 _amountGet,address _tokenGive,uint256 _amountGive) public{
        require(balanceOf(_tokenGive,msg.sender) >= _amountGive,unicode'创建订单的余额不足');//判断是否有足够余额,中文报错要用unicode
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);
        emit Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);
    }
    // 第十五步：创建单个订单，上链
    event Order(
        uint256 id,
        address user,//创建订单的用户
        address tokenGet,//KWT币地址
        uint256 amountGet,//用KWT数量
        address tokenGive,//用KWT兑换x币的地址
        uint256 amountGive,//用KWT队员x币的数量
        uint256 timestamp//时间戳
    );
    // 第十六步：取消订单方法
    function cancelOrder(uint256 _id) public{
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        orderCancel[_id] = true;
        emit Cancel(myorder.id,msg.sender,myorder.tokenGet,myorder.amountGet,myorder.tokenGive,myorder.amountGive,block.timestamp);
    }
    // 第十七步：取消订单方法，上链
    event Cancel( uint256 id,
        address user,//创建订单的用户
        address tokenGet,//KWT币地址
        uint256 amountGet,//用KWT数量
        address tokenGive,//用KWT兑换x币的地址
        uint256 amountGive,//用KWT队员x币的数量
        uint256 timestamp//时间戳
    );
    // 第十八步：完成订单,并完成转账+扣除手续费
    function fillOrder(uint256 _id) public { 
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        require(balanceOf(myorder.tokenGive,myorder.user) >= myorder.amountGive,unicode'创建者的give余额不足');
        //步骤一：完成者(购买者)手续费扣除,比如feePercent为10，乘以(mul)10，除以(div)100
        uint256 feeAmout = myorder.amountGet.mul(feePercent).div(100);
        require(balanceOf(myorder.tokenGet,msg.sender) >= myorder.amountGet.add(feeAmout),unicode'购买者的get+“小费”余额不足');
            /*  完成者扣除小费，小费账号增加 */
        tokens[myorder.tokenGet][msg.sender] = tokens[myorder.tokenGet][msg.sender].sub(feeAmout);
        tokens[myorder.tokenGet][feeAccout] = tokens[myorder.tokenGet][feeAccout].add(feeAmout);
        //步骤二：完成购买的币种（KWT）
            /* 购买者 -KWT */
        tokens[myorder.tokenGet][msg.sender] = tokens[myorder.tokenGet][msg.sender].sub(myorder.amountGet);
            /* 创建订单者 +KWT */
        tokens[myorder.tokenGet][myorder.user] = tokens[myorder.tokenGet][myorder.user].add(myorder.amountGet);
        //步骤三：完成交易的币种（ETH）
            /* 购买者 +ETH */
        tokens[myorder.tokenGive][msg.sender] =  tokens[myorder.tokenGive][msg.sender].add(myorder.amountGive);
            /* 创建订单者 -ETH */
        tokens[myorder.tokenGive][myorder.user] = tokens[myorder.tokenGive][myorder.user].sub(myorder.amountGive);
        //步骤四：改变订单状态
        orderFill[_id] = true;
        //步骤四：上链
        emit Trade(myorder.id,myorder.user,myorder.tokenGet,myorder.amountGet,myorder.tokenGive,myorder.amountGive,block.timestamp);
    }
    // 第十七步：完成订单，上链
    event Trade( uint256 id,
        address user,//创建订单的用户
        address tokenGet,//KWT币地址
        uint256 amountGet,//创建用户得到的KWT数量
        address tokenGive,//用KWT兑换x币的地址
        uint256 amountGive,//用KWT队员x币的数量
        uint256 timestamp//时间戳
    );
}
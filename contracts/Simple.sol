// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

//Custom Error
error NotPayed(string msgError);

contract Simple is ReentrancyGuard {
   
    string private _name;
    uint8 private _age;
    address public immutable owner;

    event NameSet(string name);
    event AgeSet(uint8 age);
    event ReceivedMoney(uint256 amount);
    
    modifier isPayable(){
        if(msg.value<=0){
            revert NotPayed({msgError:"You should pay to change the age"});            
        }
        _;
    }

    constructor(string  memory name_) payable {
        
        _name=name_;
        owner=msg.sender;
    }

    // using a custom modifier and an openzeppelin modifier
    // external means the function ONLY can be called from outside
    function changeAge(uint8  newAge_) external payable nonReentrant isPayable returns(uint8){

        _age=newAge_;
        emit AgeSet(newAge_);
        return newAge_;
    }

    function withdraw() external {

        require(msg.sender==owner, "NotOwner"); //It's recommended to use onlyOnwer modifier
        require(address(this).balance>0, "balance is zero");
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        // The 'call' is used to call public and external functions on contracts. 
        // It can also be used to transfer ether to an account, which happens when we dont specifying a function name in the Parentheses 
        // But it's not safe, because it bypasses type checking, function existence checking, and argument checking.
        // If the receiver account is a contract, the fallback/receive function of it will be called 
        // Which can cause Reentrancy attack. One solution is to use 'transfer' or 'send' instead, as shown in the following line
        // payable(msg.sender).transfer(address(this).balance);
        // payable(msg.sender).send(address(this).balance);
        require(success, "Transfer failed");
    }

    function getAge() public view returns (uint8){
        
        return _age;
    }

    function getName() public view returns (string memory){
    
        return _name;
    }

    function changeName(string memory newName_) public returns(string  memory){

        require(msg.sender==owner, "NotOwner"); //It's recommended to use onlyOnwer modifier
        _name=newName_;
        emit NameSet(newName_);
        return newName_;
    }
}

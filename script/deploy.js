const { ethers } = require("hardhat");
require("dotenv").config();
const hre=require("hardhat");
const { getProvider, getSigner } = require("../test/utils");

const deploy=  async ()=>{

    provider=getProvider(hre.network.name);
    deployer=await getSigner(provider);
    const SimpleFactory = await ethers.getContractFactory("Simple"); //the abi should already exist
    simpleContract = await SimpleFactory.deploy("hossein", { value: 5 });
    txDeployReceipt = await simpleContract.deploymentTransaction().wait(1);
    // after deploying a contract, we have two syntaxes that we can interact with the contract
    // 1) using the instance that we get at deploy time 
    console.log(await simpleContract.owner());
    // 2) instantiating the contract using its address and abi, then calling its functions
    simpleContract2=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);//the abi should already exist      
    console.log(await simpleContract2.owner());
    return txDeployReceipt;
}

deploy()
    .then((txDeployReceipt)=>{
        console.log("contract deployed to: ", txDeployReceipt.contractAddress);        
    }).catch((e)=>{
        console.log(e);
    })
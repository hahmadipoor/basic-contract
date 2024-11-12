const { expect } = require("chai");
const hre=require("hardhat");
const { getSigner, getProvider, getAccountOtherThanDeployer } = require("./utils");
const {ethers} =require("hardhat")

describe("Simple", function () {

  let deployer;
  let provider;
  let deployerBalanceBefore;
  let txDeployReceipt;

  before(async () => {
      provider=getProvider(hre.network.name);
      deployer=await getSigner(provider);
      deployerBalanceBefore=await provider.getBalance(deployer.address);
      const SimpleFactory = await ethers.getContractFactory("Simple");
      simpleContract = await SimpleFactory.deploy("hossein", { value: 5 });
      //waiting 1 block confirmation is ok for sepolia and local, more than 1 does not work for local
      txDeployReceipt = await simpleContract.deploymentTransaction().wait(1);
  });

  describe("Deployment", function () {
  
    it("contract should be deployed before", async function () {
      
      const deployerBalanceAfter=await provider.getBalance(deployer.address);
      expect(txDeployReceipt.from).to.equal(deployer.address);
      const contractBalance=await provider.getBalance(txDeployReceipt.contractAddress);
      expect(contractBalance).to.be.equal(5);
      if(hre.network.name!="localhost"){//only for sepolia and mainnet, not for local
        expect(deployerBalanceAfter).to.be.lt(deployerBalanceBefore);     
      }      
    });
    
    
  });

  describe("public state variables ", function() {

    it("owner of the contract should be the deployer", async function () {

      simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);      
      expect(await simpleContract.owner()).to.equal(deployer.address);

    });
  });

  describe("changeAge function", function() {

    it("When changing age, has to pay", async function () {

      simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
        if(hre.network.name!="sepolia"){//events not working on sepolia
          await expect(simpleContract.changeAge(42,{value:5})).to.emit(simpleContract, "AgeSet").withArgs(42);
        }
    });

    it("changing age without pay, should revert", async function () {

      simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
      user = await getAccountOtherThanDeployer(hre.network.name);
      await expect(simpleContract.changeAge(42)).to.be.reverted;
      //Custom Error
      await expect(simpleContract.changeAge(42)).to.be.revertedWithCustomError(simpleContract,"NotPayed");
    });
  });

  describe("withdraw function", function() {

    it("transfer money from contract to owner", async function () {

      simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
      const deployerBalanceBeforeWithdraw=await provider.getBalance(deployer);
      const contractBalanceBeforeWithdraw=await provider.getBalance(txDeployReceipt.contractAddress);
      tx=await simpleContract.withdraw();
      txResponse=await tx.wait(1); 
      const { gasUsed, cumulativeGasUsed, gasPrice }=txResponse;
      const gasCost = Number(gasUsed)*Number(gasPrice);
      const deployerBalanceAfterWithdraw=await provider.getBalance(deployer);
      expect(Number(deployerBalanceAfterWithdraw)).to.be
        .equal(Number(deployerBalanceBeforeWithdraw)-Number(gasCost)+Number(contractBalanceBeforeWithdraw));
      if(hre.network.name=="sepolia"){
        // waiting 1 block confirmation is ok for sepolia but doesn't work on local. 
        //For local  we have to set waiting to 3 but it makes chai to timeout.
        const contractBalanceAfterWithdraw=await provider.getBalance(txDeployReceipt.contractAddress);
        expect(contractBalanceAfterWithdraw).to.be.equal(0);
      }

    });
  });

  describe("getAge function", function() {

    it("should return age", async function () {

      simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
      tx=await simpleContract.changeAge(42,{value:5}); //42 is the age, 5 is the msg.value we send
      //waiting 1 block confirmation is ok for sepolia and local, more than 1 does not work for local
      txResponse=await tx.wait(1);
      const age=await simpleContract.getAge(); // Convertig the returned value to human readable number
      expect(Number(age)).to.equal(42);
    });

  });

  describe("getName function", function () {
  
    it("should return correct name", async function () {
        
        simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
        const name=await simpleContract.getName();
        expect(name).to.be.equal("hossein");
    });
  })  
  
  describe("changeName function", function() {

      it("When owner modifies name the contract should emit event", async function () { 

        simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
        if(hre.network.name!="sepolia"){//events don't work on sepolia
          await expect(simpleContract.changeName("ali")).to.emit(simpleContract, "NameSet").withArgs("ali");
        }
        const tx=await simpleContract.changeName("omid");
        const txResponse=await tx.wait(1);
        const [newName]=txResponse.logs[0].args;
        expect(newName).to.equal("omid");
      });
  
      it("No one other owner can modify the name", async function () {
  
        simpleContract=await ethers.getContractAt("Simple", txDeployReceipt.contractAddress);
        user = await getAccountOtherThanDeployer(hre.network.name);
        await expect(simpleContract.connect(user).changeName("ali")).to.be.revertedWith("NotOwner")
      });
  });
});

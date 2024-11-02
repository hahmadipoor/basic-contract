const { expect } = require("chai");
const hre=require("hardhat");
const { getSigner, getProvider, getAccountOtherThanDeployer } = require("./utils");
const {ethers} =require("hardhat")

let deployer;
let provider;

async function deploy() {
    const SimpleFactory = await ethers.getContractFactory("Simple");
    simpleContract = await SimpleFactory.deploy("hossein", { value: 5 });
    const transactionReceipt = await simpleContract.deploymentTransaction().wait(1);
    return transactionReceipt;
}

describe("Simple", function () {

  before(async () => {
      deployer=await getSigner(hre.network.name);
      provider=getProvider(hre.network.name)
    });

  describe("Deployment", function () {
  
    it("should send the deployment transaction to the network", async function () {
      
      const deployerBalanceBefore=await provider.getBalance(deployer.address);
      const transactionReceipt = await deploy();
      const deployerBalanceAfter=await provider.getBalance(deployer.address);
      expect(transactionReceipt.from).to.equal(deployer.address);
      const contractBalance=await provider.getBalance(transactionReceipt.contractAddress);
      expect(contractBalance).to.be.gte(5);
      if(hre.network.name!="localhost"){//only for sepolia and mainnet, not for local
        expect(deployerBalanceAfter).to.be.lt(deployerBalanceBefore);     
      }
      
    });
  });

  describe("getName function", function () {
    it("should return correct name", async function () {

        const transactionReceipt = await deploy(); 
        simpleContract=await ethers.getContractAt("Simple", transactionReceipt.contractAddress);
        const name=await simpleContract.getName();
        expect(name).to.be.equal("hossein");
    });

    it("should return correct owner address", async function () {

      const transactionReceipt = await deploy(); 
      simpleContract=await ethers.getContractAt("Simple", transactionReceipt.contractAddress);
      const ownerAddress=await simpleContract.owner();
      expect(ownerAddress).to.be.equal(deployer);
    });
  })  
  
  describe("setName function", function() {

      it("When owner modifies name the contract should emit event", async function () {

        const transactionReceipt = await deploy(); 
        simpleContract=await ethers.getContractAt("Simple", transactionReceipt.contractAddress);
      
        await expect(simpleContract.changeName("ali")).to.emit(simpleContract, "NameSet").withArgs("ali");
      });
  
      it("No one other owner can modify the name", async function () {
  
        const transactionReceipt = await deploy(); 
        simpleContract=await ethers.getContractAt("Simple", transactionReceipt.contractAddress);
        // accounts = await ethers.getSigners() 
        // user = accounts[1];
        user = await getAccountOtherThanDeployer(hre.network.name);
        console.log("user",user);
        await expect(simpleContract.connect(user).changeName("ali")).to.be.revertedWith("NotOwner")
      });
  })
});

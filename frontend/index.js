//const { ethers } = require("hardhat");

///import { contractAddress } from "./constants.js";
const connectButton=document.getElementById("connectButton");
const getNameButton=document.getElementById("getNameButton");
const getAgeButton=document.getElementById("getAgeButton");
const changeAgeButton=document.getElementById("changeAgeButton");
const withdrawButton=document.getElementById("withdrawButton");
const ageInput=document.getElementById("ageInput");

const contractAddress="0x5fbdb2315678afecb367f032d93f642f64180aa3";
const abi= [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name_",
          "type": "string"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "msgError",
          "type": "string"
        }
      ],
      "name": "NotPayed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "age",
          "type": "uint8"
        }
      ],
      "name": "AgeSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "NameSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "ReceivedMoney",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "newAge_",
          "type": "uint8"
        }
      ],
      "name": "changeAge",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "newName_",
          "type": "string"
        }
      ],
      "name": "changeName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAge",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

connectButton.onclick=connect;
getNameButton.onclick=getName;
getAgeButton.onclick=getAge;
withdrawButton.onclick=withdraw;
changeAgeButton.onclick=changeAge;

let provider;
let signer;
let contract;

async function connect(){
    
    if(typeof window.ethereum !="undefined"){
        try{
            await ethereum.request({method:"eth_requestAccounts"});
        }catch(error){
            console.log(error);    
        }
        connectButton.innerHTML="Connected";
        const accounts=await ethereum.request({method:"eth_accounts"});
        console.log("accounts: ",accounts);
        provider=new ethers.providers.Web3Provider(window.ethereum);
        console.log("provider: ",provider);        
        signer=provider.getSigner();
        console.log("signer: ",signer);
        const balanceInWei=await provider.getBalance(signer.getAddress());
        console.log("balance in wei: ",balanceInWei);
        const balanceInEth=await ethers.utils.formatUnits(balanceInWei.toString(),18)
        console.log("balance in ETH: ",balanceInEth);    
        contract = new ethers.Contract(contractAddress, abi, signer);
    }else{
        connectButton.innerHTML="You Need Install Metamask"
    }
    
}

async function getName(){
    const name=await contract.getName();    
    console.log(name);
}

async function getAge(){
    const age=await contract.getAge();    
    console.log(age);}

async function withdraw(){
    const tx=await contract.withdraw();
    const txResponse=await tx.wait(1); 
    console.log(txResponse);
}

async function changeAge(){
    const newAge=document.getElementById("ageInput").value;
    const tx=await contract.changeAge(newAge,{value:5});    
    const txResponse=await tx.wait(1);
    console.log(txResponse);    
}
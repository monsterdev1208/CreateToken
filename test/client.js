const axios = require('axios');
const ethers = require("ethers");
const wallets = require('./address.json');
const { parseUnits } = require('@ethersproject/units');
const https=require('https');
const chainId = 97;
const max = 1000;
const pool = "0xeF45F63CBC62dad2e289747E35a3b40ED0F08eb9";
const request=axios.create({
    httpsAgent: new https.Agent({keepAlive: true}),
});

let participant;
let amount;
let count = 0;
let _weiRaised=0;
const participants=[];
const postDeposit = () => {
    participant=wallets[parseInt(wallets.length*Math.random())];
    if(!participants.find(ele=>ele===participant)){
        participants.push(participant);
    }
    const ttt=parseInt(max*Math.random());
    amount=parseUnits(String(ttt), 15);
    request.post("http://188.166.103.74/test/special-deposit", {
        chainId,
        pool,
        participant,
        amount
    });
    _weiRaised+=ttt;
    console.log(ttt);
    console.log(_weiRaised);
    console.log(participants.length);
    count++;
    if(count<1000)
    {
        const interval=parseInt(2*Math.random());
        setTimeout(postDeposit, interval);
    }
};
postDeposit();

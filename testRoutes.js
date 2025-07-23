const express = require("express");
const router = express.Router();
const { NETWORK_SYMBOL, CHAIN_IDS } = require("./config/constants");
const { parseUnits, formatUnits } = require('@ethersproject/units');

const SpecialPools = {}, Pools = {};

for (const ele of CHAIN_IDS[process.env.NETWORK_MODE]) {
    SpecialPools[ele] = require("./models/SpecialPool_" + NETWORK_SYMBOL[ele].toUpperCase());
    Pools[ele] = require("./models/Pool_" + NETWORK_SYMBOL[ele].toUpperCase());
}

module.exports = (io) => {
    router.post("/special-deposit", (req, res) => {
        let { chainId, pool, participant, amount } = req.body;
        SpecialPools[chainId].findOne({ address: pool }).then(async _pool => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogDeposit', {
                pool, participant, amount
            });
            amount = formatUnits(amount, _pool.fundRaiseTokenDecimals);
            const new_pool = await SpecialPools[chainId].findOneAndUpdate({ address: pool },
                { $inc: { weiRaised: amount }, $addToSet: { participantsAddresses: participant } });

        });
        return res.json({ message: "ok" });
    });
    router.post("/presale-deposit", (req, res) => {
        let { chainId, pool, participant, amount } = req.body;
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogDeposit', {
            pool, participant, amount
        });
        amount = formatEther(amount);
        console.log('Log Deposit');
        console.log(amount);
        Pools[chainId].findOneAndUpdate({ address: pool },
            { $inc: { weiRaised: amount }, $addToSet: { participantsAddresses: participant } });
        return res.json({ message: "ok" });
    });
    return router;
};

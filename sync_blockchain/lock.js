const lock_abi = require("../abi/lock.json");
const ethers = require("ethers");
const erc20_abi = require("../abi/erc20.json");
const { LOCK_ADDRESS, NETWORK_SYMBOL, CHAIN_IDS } = require("../config/constants");
const pair_abi = require("../abi/pair.json");
const { BigNumber } = require("ethers");
const axios = require('axios');
// const LiquidityLocks = {}, TokenLocks = {};

// for (const ele of CHAIN_IDS[process.env.NETWORK_MODE]) {
//     LiquidityLocks[ele] = require("../models/LiquidityLock_" + NETWORK_SYMBOL[ele].toUpperCase());
//     TokenLocks[ele] = require("../models/TokenLock_" + NETWORK_SYMBOL[ele].toUpperCase());
// }



const add_liquidity_lock = async (
    amount,
    startDateTime,
    endDateTime,
    owner,
    creator,
    liquidity_token_address,
    _ethers_wss,
    _LiquidityLock
) => {
    const liquidity_contract_wss = new ethers.Contract(
        liquidity_token_address,
        pair_abi,
        _ethers_wss
    );
    const dex = await liquidity_contract_wss.name();
    const token0 = await liquidity_contract_wss.token0();
    const token1 = await liquidity_contract_wss.token1();
    const token0_contract_wss = new ethers.Contract(
        token0,
        erc20_abi,
        _ethers_wss
    );
    const token1_contract_wss = new ethers.Contract(
        token0,
        erc20_abi,
        _ethers_wss
    );
    const token0_name = await token0_contract_wss.name();
    const token1_name = await token1_contract_wss.name();
    const token0_symbol = await token0_contract_wss.symbol();
    const token1_symbol = await token1_contract_wss.symbol();
    const token0_decimals = await token0_contract_wss.decimals();

    let existed_db = await _LiquidityLock.find({
        $and: [{ owner }, { token: liquidity_token_address }],
    });
    if (existed_db.length > 0) {
        let amounts = JSON.parse(JSON.stringify(existed_db[0].amounts));
        let same_time_existed = amounts.findIndex(
            (ele) => ele.endDateTime == endDateTime * 1000
        );
        if (same_time_existed > -1) {
            amounts[same_time_existed].amount = BigNumber.from(amounts[same_time_existed].amount).add(amount);
        } else {
            amounts.push({
                endDateTime: endDateTime * 1000,
                amount,
                startDateTime: startDateTime * 1000,
            });
        }
        existed_db[0].amounts = amounts;
        existed_db[0].amount = BigNumber.from(existed_db[0].amount).add(amount);
        await existed_db[0].save();
    } else {
        const liquidity = {
            token: liquidity_token_address,
            owner,
            creator,
            amounts: [
                {
                    amount,
                    endDateTime: endDateTime * 1000,
                    startDateTime: startDateTime * 1000,
                },
            ],
            amount,
            token0_name,
            token1_name,
            token0_decimals,
            token0_symbol,
            token1_symbol,
            dex,
            token0,
            token1,
        };
        const newLiquidityLock = new _LiquidityLock(liquidity);
        await newLiquidityLock.save();
    }
    return {
        token: liquidity_token_address,
        owner,
        creator,
        endDateTime: endDateTime * 1000,
        startDateTime: startDateTime * 1000,
        amount,
        token0_name,
        token1_name,
        token0_symbol,
        token1_symbol,
        token0_decimals,
        dex,
        token0,
        token1,
    };
};

const add_token_lock = async (
    amount,
    startDateTime,
    endDateTime,
    owner,
    creator,
    token_address,
    _ethers_wss,
    _TokenLock
) => {
    const token_contract_wss = new ethers.Contract(
        token_address,
        erc20_abi,
        _ethers_wss
    );
    const name = await token_contract_wss.name();
    const symbol = await token_contract_wss.symbol();
    const decimals = await token_contract_wss.decimals();


    let existed_db = await _TokenLock.find({
        $and: [{ owner }, { token: token_address }],
    });
    if (existed_db.length > 0) {
        try {
            let amounts = JSON.parse(JSON.stringify(existed_db[0].amounts));
            let same_time_existed = amounts.findIndex(
                (ele) => ele.endDateTime == endDateTime * 1000
            );
            if (same_time_existed > -1) {
                amounts[same_time_existed].amount = BigNumber.from(amounts[same_time_existed].amount).add(amount);
            } else {
                amounts.push({
                    endDateTime: endDateTime * 1000,
                    amount,
                    startDateTime: startDateTime * 1000,
                });
            }
            existed_db[0].amount = BigNumber.from(existed_db[0].amount).add(amount);
            existed_db[0].amounts = amounts;
            await existed_db[0].save();
        } catch (err) {
            console.log(err);
        }
    } else {
        const token = {
            token: token_address,
            owner,
            creator,
            amounts: [
                {
                    amount,
                    endDateTime: endDateTime * 1000,
                    startDateTime: startDateTime * 1000,
                },
            ],
            amount,
            name,
            symbol,
            decimals,
        };
        const newTokenLock = new _TokenLock(token);
        await newTokenLock.save();
    }
    return {
        token: token_address,
        owner,
        creator,
        endDateTime: endDateTime * 1000,
        startDateTime: startDateTime * 1000,
        amount,
        name,
        symbol,
        decimals,
    };
};

// const get_locks = async (ethers_wss, chainId) => {
//     const lock_contract_wss = new ethers.Contract(
//         LOCK_ADDRESS[chainId],
//         lock_abi,
//         ethers_wss
//     );
//     await LiquidityLocks[chainId].deleteMany({});
//     await TokenLocks[chainId].deleteMany({});
//     let i = 0;
//     while (true) {
//         try {
//             const liquidity_token_address = await lock_contract_wss.liquidities(
//                 i
//             );
//             let k = 0;
//             while (true) {
//                 try {
//                     const { amount, startDateTime, endDateTime, owner, creator } =
//                         await lock_contract_wss.liquidityList(liquidity_token_address);
//                     if (amount.gt(0))
//                         await add_liquidity_lock(
//                             amount,
//                             startDateTime,
//                             endDateTime,
//                             owner,
//                             creator,
//                             liquidity_token_address,
//                             ethers_wss,
//                             LiquidityLocks[chainId]
//                         );
//                 } catch (error) {
//                     break;
//                 }
//                 k++;
//             }
//         } catch (err) {
//             break;
//         }
//         i++;
//     }
//     i = 0;
//     while (true) {
//         try {
//             const token_address = await lock_contract_wss.tokens(i);
//             let k = 0;
//             while (true) {
//                 try {
//                     const { amount, startDateTime, endDateTime, owner, creator } =
//                         await lock_contract_wss.tokenList(token_address, k);
//                     if (amount.gt(0))
//                         await add_token_lock(
//                             amount,
//                             startDateTime,
//                             endDateTime,
//                             owner,
//                             creator,
//                             token_address,
//                             ethers_wss,
//                             TokenLocks[chainId]
//                         );
//                 } catch (error) {
//                     break;
//                 }
//                 k++;
//             }
//         } catch (err) {
//             break;
//         }
//         i++;
//     }
// };
const event_locks = (ethers_wss, io, chainId) => {
    const lock_contract_wss = new ethers.Contract(
        LOCK_ADDRESS[chainId],
        lock_abi,
        ethers_wss
    );
    lock_contract_wss.on(
        "LiquidityLockAdded",
        (
            token, amount, owner, token0Name, token1Name, token0Symbol, token1Symbol
        ) => {
            io.emit('lock:' + NETWORK_SYMBOL[chainId] + ':LiquidityLockAdded', {
                liquidity:token, amount, owner, token0Name, token1Name, token0Symbol, token1Symbol
            });            
        }
    );
    lock_contract_wss.on(
        "TokenLockAdded",
        (
            token, amount, owner, name, symbol, decimals
        ) => {
            io.emit('lock:' + NETWORK_SYMBOL[chainId] + ':TokenLockAdded', {
                token, amount, owner, name, symbol, decimals
            });
        }
    );
    lock_contract_wss.on(
        "UnlockLiquidity",
        (token, amount) => {
            io.emit('lock:' + NETWORK_SYMBOL[chainId] + ':UnlockLiquidity', {liquidity:token, amount});
        }
    );
    lock_contract_wss.on(
        "UnlockToken",
        (token, amount) => {
            io.emit('lock:' + NETWORK_SYMBOL[chainId] + ':UnlockToken', {token, amount});
        }
    );
};

module.exports = {
    // get_locks, 
    event_locks};
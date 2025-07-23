const webpush = require("web-push");
const pair_abi = require("../abi/pair.json");
const ethers = require("ethers");
const erc20_abi = require("../abi/erc20.json");
const defi_addresses = require('../config/addresses.json');
const { formatEther, formatUnits } = require('@ethersproject/units');
const axios = require('axios');
const { BigNumber } = require("ethers");
const ido_abi = require("../abi/ido.json");

webpush.setVapidDetails(
    "mailto:thegempad@gmail.com",
    "BPBcNP9ZuD5Dk-IeFA8Uz5Sbemi3S2NjLDKW_iedPu7rASN1ZpNuL9Pin3iDSdU--kpAgyzUL4qATc0xFQajpDg",
    "s44ya4zuG8byJVVqqxpVGvDyWZ34GIbT4P0-VYzkskg"
);
const auth =
    'Basic ' + Buffer.from(process.env.IPFS_ID +
        ':' + process.env.IPFS_SECRET).toString('base64');

const SpecialPools = {};
const Pools = {}, Trend = require("../models/Trend");
// const LiquidityLocks = {}, TokenLocks = {};





// exports.getLiquidities = async (req, res) => {
//     try {
//         const network = req.params.network;
//         const search = req.query.search;
//         const page = req.query.page || 1;
//         const tab = req.query.tab || 0;
//         let liquidities;
//         let counts;
//         if (tab > 0) {
//             let findState = {},
//                 tabState = {},
//                 searchState = {};
//             if (search) {
//                 searchState = {
//                     token: search,
//                 };
//             }
//             if (tab == 2) {
//                 tabState = { owner: req.query.account };
//             }

//             findState = {
//                 $and: [searchState, tabState],
//             };
//             liquidities = await LiquidityLocks[network].find(findState, {
//                 token0_name: 1,
//                 token1_name: 1,
//                 token0_symbol: 1,
//                 token1_symbol: 1,
//                 amount: 1,
//                 token: 1,
//                 owner: 1,
//                 token0: 1,
//                 token1: 1,
//             }).sort({ "createdAt": -1 })
//                 .skip(24 * (page - 1))
//                 .limit(24);
//             counts = await LiquidityLocks[network].find(findState).sort({ "createdAt": -1 }).countDocuments();
//             counts = Math.ceil(counts / 24);
//         } else {
//             liquidities = [];
//             let searchState = {};
//             if (search) {
//                 searchState = {
//                     $or: [
//                         {
//                             projectTokenAddress: { $regex: search, $options: "i" },
//                         },
//                         {
//                             name: { $regex: search, $options: "i" },
//                         },
//                         {
//                             symbol: { $regex: search, $options: "i" },
//                         },
//                     ],
//                 };
//             }
//             const findState = {
//                 $and: [searchState, { status: '1' }],
//             };
//             const tmp = await Pools[network].find(findState).sort({ "createdAt": -1 })
//                 .skip(24 * (page - 1))
//                 .limit(24);
//             for (let i = 0; i < tmp.length; i++) {
//                 const item = {};
//                 item.token0_name = tmp[i].name;
//                 item.token1_name = tmp[i].fundRaiseTokenName ? tmp[i].fundRaiseTokenName : "Wrapped BNB";
//                 item.token0_symbol = tmp[i].symbol;
//                 item.token1_symbol = tmp[i].fundRaiseTokenSymbol ? tmp[i].fundRaiseTokenSymbol : "WBNB";
//                 item.projectTokenAddress = tmp[i].projectTokenAddress;
//                 item.fundRaiseToken = tmp[i].fundRaiseTokenAddress ? tmp[i].fundRaiseTokenAddress : "";
//                 item.pool = tmp[i].address;
//                 liquidities.push(item);
//             }
//             counts = await Pools[network].find(findState).sort({ "createdAt": -1 }).countDocuments();
//             counts = Math.ceil(counts / 24);
//         }
//         res.json({ liquidities, counts });
//     } catch (err) {
//         console.log(err);
//     }
// };

// exports.getTokens = async (req, res) => {
//     const network = req.params.network;
//     const search = req.query.search;
//     const page = req.query.page || 1;
//     const tab = req.query.tab || 0;

//     let tokens;
//     let findState = {},
//         tabState = {},
//         searchState = {};
//     if (search) {
//         searchState = {
//             token: search,
//         };
//     }
//     if (tab == 1) {
//         tabState = { owner: req.query.account };
//     }

//     findState = {
//         $and: [searchState, tabState],
//     };
//     tokens = await TokenLocks[network].find(findState, {
//         name: 1,
//         symbol: 1,
//         amount: 1,
//         token: 1,
//         owner: 1,
//         decimals: 1
//     }).sort({ "createdAt": -1 })
//         .skip(24 * (page - 1))
//         .limit(24);
//     let counts = await TokenLocks[network].find(findState).sort({ "createdAt": -1 }).countDocuments();

//     counts = Math.ceil(counts / 24);
//     res.json({ tokens, counts });
// };

// exports.getLiquidity = async (req, res) => {
//     const network = req.params.network;
//     let liquidity;
//     if (req.params.owner != '') {
//         liquidity = await LiquidityLocks[network].findOne({
//             $and: [{ token: req.params.token }, { owner: req.params.owner }],
//         });
//     } else {
//         liquidity = {};
//         pool = await Pools[network].findOne({ address: req.params.token });
//         liquidity.token0_name = pool.name;
//         liquidity.token1_name = pool.fundRaiseTokenName ? pool.fundRaiseTokenName : "Wrapped BNB";
//         liquidity.token0_symbol = pool.symbol;
//         liquidity.token1_symbol = pool.fundRaiseTokenSymbol ? pool.fundRaiseTokenSymbol : "WBNB";
//         liquidity.token0_decimals = pool.decimals;
//         liquidity.token1_decimals = pool.fundRaiseTokenDecimals;
//         liquidity.projectTokenAddress = pool.projectTokenAddress;
//         liquidity.fundRaiseToken = pool.fundRaiseTokenAddress ? pool.fundRaiseTokenAddress : "";
//     }

//     res.json({ liquidity });
// };

// exports.getToken = async (req, res) => {
//     const network = req.params.network;
//     let token = await TokenLocks[network].findOne({
//         $and: [{ token: req.params.token }, { owner: req.params.owner }],
//     });

//     res.json({ token });
// };


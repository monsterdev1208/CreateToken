const ido_abi = require("../abi/ido.json");
const pool_abi = require("../abi/pool.json");
const multicall_abi = require("../abi/multicall.json");
const { BigNumber } = require("ethers");

const ethers = require("ethers");
const erc20_abi = require("../abi/erc20.json");
const { AddressZero } = require("@ethersproject/constants");
const setDaysTimeout = require('../utils/setDaysTimeout');
const { IDO_ADDRESS, NETWORK_SYMBOL, CHAIN_IDS, MULTICALL_ADDRESS, DefaultFundRaiseToken, WETH_ADDRESS } = require("../config/constants");
const { formatEther, formatUnits, parseEther, parseUnits } = require('@ethersproject/units');
const axios = require('axios');
const Pools = {};
// const Carousels = {};
const SpecialPools = {};
const Trend = require("../models/Trend");
for (const ele of CHAIN_IDS[process.env.NETWORK_MODE]) {
    Pools[ele] = require("../models/Pool_" + NETWORK_SYMBOL[ele].toUpperCase());
    // Carousels[ele] = require("../models/Carousel_" + NETWORK_SYMBOL[ele].toUpperCase());
    SpecialPools[ele] = require("../models/SpecialPool_" + NETWORK_SYMBOL[ele].toUpperCase());
}
Pools["0"] = require("../models/Pool");



const get_Pool = async (address, _ido_contract_wss, _ethers_wss, multicall_contract_wss, chainId) => {
    try {
        const owner = await _ido_contract_wss.poolOwners(address);
        let fairLaunch = false;
        let fairPresaleAmount = 0;
        let isNewPool, isBurn, safu;
        if(chainId==2000){
            isNewPool=true;
        }else{
            try {
                isNewPool = await _ido_contract_wss.isNewPool(address);
            } catch (err) {
                isNewPool = false;
            }
        }
        
        try {
            isBurn = await _ido_contract_wss.isBurn(address);
        } catch (err) {
            isBurn = false;
        }
        try {
            safu = await _ido_contract_wss.safu(address);
        } catch (err) {
            safu = false;
        }
        let is_hide = false;
        try {
            is_hide = await _ido_contract_wss.isHiddenPool(address);
        } catch (err) { }
        let whiteListTimer = 10;
        try {
            whiteListTimer = await _ido_contract_wss.whiteListTimer(address);
        } catch (err) { }
        if (!isNewPool) {
            const pool_contract = new ethers.Contract(address, pool_abi, _ethers_wss);

            const weiRaised = await pool_contract._weiRaised();
            const poolPercentFee = await pool_contract.poolPercentFee();
            let {
                hardCap,
                softCap,
                presaleRate,
                dexCapPercent,
                dexRate,
                projectTokenAddress,
                status,
                tier,
                kyc
            } = await pool_contract.poolInformation();
            let {
                startDateTime,
                endDateTime,
                listDateTime,
                minAllocationPerUser,
                maxAllocationPerUser,
                dexLockup,
                extraData,
                // refund,
                whitelistable,
                audit,
                auditLink,
            } = await pool_contract.poolDetails();

            startDateTime = startDateTime * 1000;
            endDateTime = endDateTime * 1000;
            listDateTime = listDateTime * 1000;
            const erc20_contract = new ethers.Contract(
                projectTokenAddress,
                erc20_abi,
                _ethers_wss
            );


            const decimals = await erc20_contract.decimals();
            const totalSupply = await erc20_contract.totalSupply();

            const symbol = await erc20_contract.symbol();
            const name = await erc20_contract.name();
            let {
                vestingAmount,
                unlockedVestingAmount,
                firstPercent,
                firstPeriod,
                eachPercent,
                eachPeriod
            } = await pool_contract.poolVesting();
            let userVesting = {
                isVesting: false,
                firstPercent: 0,
                eachPercent: 0,
                eachPeriod: 0
            };

            const whiteLists = [], participantsAddresses = [];

            if (whitelistable) {
                let k = 0;
                while (true) {
                    try {
                        const whiteList = await pool_contract.whitelistedAddressesArray(k);
                        whiteLists.push(whiteList);
                    } catch (err) {
                        break;
                    }
                    k++;
                }
            }
            let k = 0;
            while (true) {
                try {
                    const participantsAddress = await pool_contract.participantsAddress(k);
                    participantsAddresses.push(participantsAddress);
                } catch (err) {
                    break;
                }
                k++;
            }
            let ipfs = {};
            try {
                let response_ipfs;
                response_ipfs = await axios.get(
                    `https://gem.infura-ipfs.io/ipfs/${extraData}`
                );
                ipfs = response_ipfs.data;
            } catch (error) {
                console.log(error);
            }
            let priceWETH = await multicall_contract_wss.getPrice(WETH_ADDRESS[chainId]);
            // console.log(formatUnits(priceWETH, DefaultFundRaiseToken[String(chainId)][1]['decimals']));
            const initialMarketCap = (totalSupply.div(dexRate).mul(priceWETH).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();


            const pool = {
                address,
                owner,
                weiRaised: weiRaised.toString(),
                hardCap: hardCap.toString(),
                softCap: softCap.toString(),
                weiRaisedNumber: formatEther(weiRaised),
                hardCapNumber: formatEther(hardCap),
                softCapNumber: formatEther(softCap),
                presaleRate: presaleRate.toString(),
                dexCapPercent: Number(dexCapPercent),
                dexRate: dexRate.toString(),
                projectTokenAddress,
                status,
                tier,
                kyc,
                startDateTime,
                endDateTime,
                listDateTime,
                minAllocationPerUser: minAllocationPerUser.toString(),
                maxAllocationPerUser: maxAllocationPerUser.toString(),
                dexLockup: Number(dexLockup),
                extraData,
                ipfs,
                isBurn,
                whitelistable,
                decimals,
                whiteLists,
                poolPercentFee,
                participantsAddresses,
                symbol,
                name,
                totalSupply: totalSupply.toString(),
                audit,
                auditLink,
                teamVesting_amount: vestingAmount.toString(),
                teamVesting_unlocked_amount: unlockedVestingAmount.toString(),
                teamVesting_first_percent: firstPercent,
                teamVesting_first_period: firstPeriod,
                teamVesting_each_percent: eachPercent,
                teamVesting_each_period: eachPeriod,
                userVesting_is: userVesting.isVesting,
                userVesting_first_percent: userVesting.firstPercent,
                userVesting_each_percent: userVesting.eachPercent,
                userVesting_each_period: userVesting.eachPeriod,
                is_hide, safu,
                whiteListTimer,
                fundRaiseTokenSymbol: DefaultFundRaiseToken[chainId][0]['symbol'],
                initialMarketCap
            };
            return pool;
        } else {
            fairLaunch = await _ido_contract_wss.fairLaunch(address);
            fairPresaleAmount = await _ido_contract_wss.fairPresaleAmount(address);
            const weiRaised = await _ido_contract_wss._weiRaised(address);
            let userVesting_cliff;
            if (chainId != '1')
                userVesting_cliff = await _ido_contract_wss.cliff(address);
            const poolPercentFee = await _ido_contract_wss.poolPercentFee();
            let {
                hardCap,
                softCap,
                presaleRate,
                dexCapPercent,
                dexRate,
                projectTokenAddress,
                status,
                tier,
                kyc
            } = await _ido_contract_wss.poolInformation(address);
            let {
                startDateTime,
                endDateTime,
                listDateTime,
                minAllocationPerUser,
                maxAllocationPerUser,
                dexLockup,
                extraData,
                // refund,
                whitelistable,
                audit,
                auditLink,
            } = await _ido_contract_wss.poolDetails(address);
            let isTieredWhitelist = await _ido_contract_wss.isTieredWhitelist(address);
            startDateTime = startDateTime * 1000;
            endDateTime = endDateTime * 1000;
            listDateTime = listDateTime * 1000;
            let erc20_contract = new ethers.Contract(
                projectTokenAddress,
                erc20_abi,
                _ethers_wss
            );
            const noTier = await _ido_contract_wss._didRefundForDickVerse(address);
            let decimals = 18;
            let totalSupply = await _ido_contract_wss.totalSupply(address);
            let symbol = "$coin";
            let name = "Stealth Launch Coin";
            if (projectTokenAddress !== AddressZero) {
                const erc20_contract = new ethers.Contract(
                    projectTokenAddress,
                    erc20_abi,
                    _ethers_wss
                );


                decimals = await erc20_contract.decimals();
                totalSupply = await erc20_contract.totalSupply();

                symbol = await erc20_contract.symbol();
                name = await erc20_contract.name();
            }
            let {
                vestingAmount,
                unlockedVestingAmount,
                firstPercent,
                firstPeriod,
                eachPercent,
                eachPeriod
            } = await _ido_contract_wss.poolVesting(address);
            let userVesting;
            try {
                userVesting = await _ido_contract_wss.userVesting(address);
            } catch (err) {
                userVesting = {
                    isVesting: false,
                    firstPercent: 0,
                    eachPercent: 0,
                    eachPeriod: 0
                };
            }
            const isStealth = await _ido_contract_wss.isStealth(address);

            let fundRaiseTokenAddress = await _ido_contract_wss.fundRaiseToken(address);
            let fundRaiseTokenDecimals = await _ido_contract_wss.fundRaiseTokenDecimals(address);
            const isAntiSniper = await _ido_contract_wss.isAntiSniper(address);
            const keyForAntiSniper = await _ido_contract_wss.keyForAntiSniper(address);
            fundRaiseTokenDecimals = fundRaiseTokenDecimals && fundRaiseTokenDecimals > 0 ? fundRaiseTokenDecimals : 18;
            let fundRaiseTokenName;
            let fundRaiseTokenSymbol;
            if (fundRaiseTokenAddress != AddressZero) {
                erc20_contract = new ethers.Contract(
                    fundRaiseTokenAddress,
                    erc20_abi,
                    _ethers_wss
                );
                fundRaiseTokenName = await erc20_contract.name();
                fundRaiseTokenSymbol = await erc20_contract.symbol();
            } else {
                fundRaiseTokenSymbol = DefaultFundRaiseToken[chainId][0]['symbol'];
            }

            let whiteLists = [], participantsAddresses = [], whiteListsForTiered = [];

            if (whitelistable) {
                if (chainId != '1') {
                    try {
                        [whiteLists, whiteListsForTiered] = await _ido_contract_wss.getWhitelistAddresses(address);
                        // console.log([whiteLists,whiteListsForTiered]);
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    let k = 0;

                    while (true) {
                        try {
                            const whiteList = await _ido_contract_wss.whitelistedAddressesArray(address, k);
                            whiteLists.push(whiteList);
                        } catch (err) {
                            break;
                        }
                        k++;
                    }
                }
            }
            if (chainId == '1') {
                if (isTieredWhitelist) {
                    let k = 0;
                    while (true) {
                        try {
                            const whiteList = await _ido_contract_wss.whitelistedAddressesArrayForTiered(address, k);
                            whiteListsForTiered.push(whiteList);
                        } catch (err) {
                            break;
                        }
                        k++;
                    }
                }
            }
            if (chainId != '1') {
                try {
                    participantsAddresses = await _ido_contract_wss.getParticipantsAddresses(address);
                    // participantsAddresses.push(participantsAddress);
                    // console.log(participantsAddresses);
                } catch (err) {
                    console.log(err);
                }
            } else {
                let k = 0;
                while (true) {
                    try {
                        const participantsAddress = await _ido_contract_wss.participantsAddress(address, k);
                        participantsAddresses.push(participantsAddress);
                    } catch (err) {
                        break;
                    }
                    k++;
                }
            }


            let ipfs = {};
            try {
                let response_ipfs;
                response_ipfs = await axios.get(
                    `https://gem.infura-ipfs.io/ipfs/${extraData}`
                );
                ipfs = response_ipfs.data;
            } catch (error) {
                console.log(error);
            }
            let title = "";
            if (isStealth) {
                title = ipfs.title;
            }
            let initialMarketCap;
            if (fundRaiseTokenAddress === undefined || fundRaiseTokenAddress === AddressZero) {
                let priceWETH = await multicall_contract_wss.getPrice(WETH_ADDRESS[chainId]);
                // console.log(formatUnits(priceWETH, DefaultFundRaiseToken[String(chainId)][1]['decimals']));
                if (!fairLaunch) {
                    initialMarketCap = (totalSupply.div(dexRate).mul(priceWETH).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                } else {
                    initialMarketCap = (totalSupply.mul(softCap).div(fairPresaleAmount).div(parseEther('1')).mul(priceWETH).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                }
            } else if (fundRaiseTokenAddress === DefaultFundRaiseToken[String(chainId)][1]['address']) {
                if (!fairLaunch) {
                    initialMarketCap = (totalSupply.div(dexRate)).toNumber();
                } else {
                    initialMarketCap = (totalSupply.mul(parseUnits('1', fundRaiseTokenDecimals)).div(parseUnits('1', decimals)).div(fairPresaleAmount.mul(parseUnits('1', fundRaiseTokenDecimals)).div(parseUnits('1', decimals)).div(softCap)).div(parseUnits('1', fundRaiseTokenDecimals))).toNumber();
                }
            } else {
                let priceFundToken = await multicall_contract_wss.getPrice(fundRaiseTokenAddress);
                if (!fairLaunch) {
                    initialMarketCap = (totalSupply.div(dexRate).mul(priceFundToken).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                } else {
                    initialMarketCap = (totalSupply.mul(softCap).div(fairPresaleAmount).div(parseUnits('1', fundRaiseTokenDecimals)).mul(priceFundToken).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                }
            }
            const pool = {
                title,
                address,
                owner,
                fairLaunch,
                fairPresaleAmount: fairPresaleAmount.toString(),
                weiRaised: weiRaised.toString(),
                hardCap: hardCap.toString(),
                softCap: softCap.toString(),
                weiRaisedNumber: formatUnits(weiRaised, fundRaiseTokenDecimals),
                hardCapNumber: formatUnits(hardCap, fundRaiseTokenDecimals),
                softCapNumber: formatUnits(softCap, fundRaiseTokenDecimals),
                presaleRate: presaleRate.toString(),
                dexCapPercent: Number(dexCapPercent),
                dexRate: dexRate.toString(),
                projectTokenAddress,
                status,
                tier,
                kyc,
                noTier,
                startDateTime,
                endDateTime,
                listDateTime,
                userVesting_cliff,
                minAllocationPerUser: minAllocationPerUser.toString(),
                maxAllocationPerUser: maxAllocationPerUser.toString(),
                dexLockup: Number(dexLockup),
                extraData,
                ipfs,
                isBurn,
                whitelistable,
                decimals,
                whiteLists,
                poolPercentFee,
                participantsAddresses,
                symbol,
                name,
                totalSupply: totalSupply.toString(),
                audit,
                auditLink,
                teamVesting_amount: vestingAmount.toString(),
                teamVesting_unlocked_amount: unlockedVestingAmount.toString(),
                teamVesting_first_percent: firstPercent,
                teamVesting_first_period: firstPeriod,
                teamVesting_each_percent: eachPercent,
                teamVesting_each_period: eachPeriod,
                userVesting_is: userVesting.isVesting,
                userVesting_first_percent: userVesting.firstPercent,
                userVesting_each_percent: userVesting.eachPercent,
                userVesting_each_period: userVesting.eachPeriod,
                is_hide,
                fundRaiseTokenAddress,
                fundRaiseTokenDecimals,
                fundRaiseTokenSymbol,
                fundRaiseTokenName,
                whiteListTimer,
                isTieredWhitelist,
                whiteListsForTiered,
                isStealth, safu,
                initialMarketCap,
                isAntiSniper,
                keyForAntiSniper
            };
            return pool;
        }

    } catch (err) {
        if(chainId==2000)
            console.log(err);
        // console.log("error on IDO pool read");
        // console.log(err);
        return null;
    }
};

const get_IDOs = async (ethers_wss, send_alarm_IDO, chainId) => {
    const ido_contract_wss = new ethers.Contract(
        IDO_ADDRESS[chainId],
        ido_abi,
        ethers_wss
    );
    const multicall_contract_wss = new ethers.Contract(
        MULTICALL_ADDRESS[chainId],
        multicall_abi,
        ethers_wss
    );
    let i = 0;
    // await Pools[chainId].deleteMany({});
    while (true) {
        try {
            const address = await ido_contract_wss.poolAddresses(i);
            let pool = await get_Pool(address, ido_contract_wss, ethers_wss, multicall_contract_wss, chainId);
            if (pool != null) {
                let isExisted;
                try {
                    isExisted = await Pools[chainId].findOne({ address });
                    if (isExisted) {
                        for (let ele in pool) {
                            isExisted[ele] = pool[ele];
                        }
                        await isExisted.save();
                    } else {
                        const newPool = new Pools[chainId](pool);
                        await newPool.save();
                    }
                } catch (err) {
                    if(chainId==2000)
                        console.log(err);
                    const newPool = new Pools[chainId](pool);
                    await newPool.save();
                }
                
                if (pool.isStealth) {
                    pool.name = pool.title;
                }
                try {
                    isExisted = await Pools['0'].findOne({ '$and': [{ address }, { chain: Number(chainId) }] });
                    if (isExisted) {
                        for (let ele in pool) {
                            isExisted[ele] = pool[ele];
                        }
                        await isExisted.save();
                    } else {
                        pool.chain = Number(chainId);
                        const newPool = new Pools['0'](pool);
                        await newPool.save();
                    }
                } catch (err) {
                    if(chainId==2000)
                        console.log(err);
                    pool.chain = Number(chainId);
                    const newPool = new Pools['0'](pool);
                    await newPool.save();
                }
                
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.startDateTime) - Date.now() - 5 * 60 * 1000,
                    chainId,
                    address,
                    "presale",
                    "5"
                );
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.startDateTime) - Date.now() - 15 * 60 * 1000,
                    chainId,
                    address,
                    "presale",
                    "15"
                );
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.startDateTime) - Date.now() - 30 * 60 * 1000,
                    chainId,
                    address,
                    "presale",
                    "30"
                );
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.listDateTime) - Date.now() - 5 * 60 * 1000,
                    chainId,
                    address,
                    "listing",
                    "5"
                );
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.listDateTime) - Date.now() - 15 * 60 * 1000,
                    chainId,
                    address,
                    "listing",
                    "15"
                );
                setDaysTimeout(
                    send_alarm_IDO,
                    parseInt(pool.listDateTime) - Date.now() - 30 * 60 * 1000,
                    chainId,
                    address,
                    "listing",
                    "30"
                );
            }
        } catch (err) {
            if(chainId==2000)
                console.log(err);
            break;
        }
        i++;
    }

    // await Carousels[chainId].deleteMany({});
    // let carousel_ipfs = await ido_contract_wss.carousel();
    // if (carousel_ipfs) {
    //     let response_ipfs = await axios.get(
    //         `https://ipfs.infura.io/ipfs/${carousel_ipfs}`
    //     );
    //     for (let item of response_ipfs.data) {
    //         try {
    //             let pool;
    //             if (item.type == "special") {
    //                 pool = await SpecialPools[chainId].findOne({ address: item.pool });
    //             } else {
    //                 pool = await Pools[chainId].findOne({ address: item.pool });
    //             }
    //             item.logo = pool.ipfs.logo;
    //             const newCarousel = new Carousels[chainId](item);
    //             await newCarousel.save();
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    // }



}
const event_IDOs = (ethers_wss, send_alarm_IDO, io, chainId) => {
    const ido_contract_wss = new ethers.Contract(
        IDO_ADDRESS[chainId],
        ido_abi,
        ethers_wss
    );
    const multicall_contract_wss = new ethers.Contract(
        MULTICALL_ADDRESS[chainId],
        multicall_abi,
        ethers_wss
    );
    // ido_contract_wss.on("LogCarouselUpdated", async (oldCarousel, newCarousel) => {
    //     try {
    //         await Carousels[chainId].deleteMany({});
    //         console.log(newCarousel);
    //         if (newCarousel) {
    //             let response_ipfs = await axios.get(
    //                 `https://ipfs.infura.io/ipfs/${newCarousel}`
    //             );
    //             console.log(response_ipfs);
    //             console.log(response_ipfs.data);
    //             for (let item of response_ipfs.data) {
    //                 let pool;
    //                 if (item.type == "special") {
    //                     pool = await SpecialPools[chainId].findOne({ address: item.pool });
    //                 } else
    //                     pool = await Pools[chainId].findOne({ address: item.pool });
    //                 item.logo = pool.ipfs.logo;
    //                 const newCarousel = new Carousels[chainId](item);
    //                 await newCarousel.save();
    //             }
    //         }

    //         const carousel_db = await Carousels[chainId].find({});
    //         const carousel = [];
    //         if (carousel_db.length > 0) {
    //             for (let ele of carousel_db) {
    //                 const item = {
    //                     pool: ele.pool,
    //                     title: ele.title,
    //                     subTitle: ele.subTitle,
    //                     isHot: ele.isHot,
    //                     logo: ele.logo,
    //                     action: "",
    //                     type: ele.type
    //                 }
    //                 carousel.push(item);
    //             }
    //         }

    //         io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogCarouselUpdated', {
    //             carousel
    //         });
    //     } catch (err) { console.log(err); }
    // });
    ido_contract_wss.on("LogPoolKYCUpdate", (pool, kyc) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolKYCUpdate', {
            pool, kyc
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { kyc: kyc });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { kyc: kyc });
        })();
    });
    ido_contract_wss.on("LogPoolSafuUpdate", (pool, safu) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolSafuUpdate', {
            pool, safu
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { safu: safu });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { safu: safu });
        })();
    });
    ido_contract_wss.on(
        "LogPoolAuditUpdate",
        (pool, audit, auditLink) => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolAuditUpdate', {
                pool, audit, auditLink
            });
            (async () => {
                await Pools[chainId].findOneAndUpdate(
                    { address: pool },
                    { audit: audit, auditLink: auditLink }
                );
                await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { audit: audit, auditLink: auditLink });
            })();
        }
    );

    ido_contract_wss.on("LogPoolCreated", (_addresses, model, details,
        vesting, userVesting, _uints, _bools) => {
        (async () => {
            try {
                let ipfs = {};
                const weiRaised = 0;
                let {
                    hardCap,
                    softCap,
                    presaleRate,
                    dexCapPercent,
                    dexRate,
                    projectTokenAddress,
                    status,
                    tier,
                    kyc
                } = model;
                let {
                    startDateTime,
                    endDateTime,
                    listDateTime,
                    minAllocationPerUser,
                    maxAllocationPerUser,
                    dexLockup,
                    extraData,
                    // refund,
                    whitelistable,
                    audit,
                    auditLink,
                } = details;
                fundRaiseTokenDecimals = _uints[2] && _uints[2] > 0 ? _uints[2] : 18;
                startDateTime = startDateTime * 1000;
                endDateTime = endDateTime * 1000;
                listDateTime = listDateTime * 1000;
                let decimals = 18;
                let totalSupply = _uints[3];
                let symbol = "$coin";
                let name = "Stealth Launch Coin";
                if (projectTokenAddress !== AddressZero) {
                    const erc20_contract = new ethers.Contract(
                        projectTokenAddress,
                        erc20_abi,
                        ethers_wss
                    );


                    decimals = await erc20_contract.decimals();
                    totalSupply = await erc20_contract.totalSupply();

                    symbol = await erc20_contract.symbol();
                    name = await erc20_contract.name();
                }
                let {
                    vestingAmount,
                    unlockedVestingAmount,
                    firstPercent,
                    firstPeriod,
                    eachPercent,
                    eachPeriod
                } = vesting;
                let fundRaiseTokenName;
                let fundRaiseTokenSymbol;
                if (_addresses[2] != AddressZero) {
                    const erc20_contract = new ethers.Contract(
                        _addresses[2],
                        erc20_abi,
                        ethers_wss
                    );
                    fundRaiseTokenName = await erc20_contract.name();
                    fundRaiseTokenSymbol = await erc20_contract.symbol();
                } else {
                    fundRaiseTokenSymbol = DefaultFundRaiseToken[chainId][0]['symbol'];
                }
                const whiteLists = [], participantsAddresses = [];
                const poolPercentFee = await ido_contract_wss.poolPercentFee();

                try {
                    let response_ipfs;
                    response_ipfs = await axios.get(
                        `https://gem.infura-ipfs.io/ipfs/${extraData}`
                    );
                    ipfs = response_ipfs.data;
                } catch (error) {
                    console.log(error);
                }
                let title = "";
                if (_bools[3]) {
                    title = ipfs.title;
                }
                let initialMarketCap;
                if (_addresses[2] === undefined || _addresses[2] === AddressZero) {
                    let priceWETH = await multicall_contract_wss.getPrice(WETH_ADDRESS[chainId]);
                    // console.log(formatUnits(priceWETH, DefaultFundRaiseToken[String(chainId)][1]['decimals']));
                    if (!_bools[1]) {
                        initialMarketCap = (totalSupply.div(dexRate).mul(priceWETH).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                    } else {
                        console.log(_uints[1]);
                        console.log(parseEther('1'));
                        console.log(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']));
                        console.log(DefaultFundRaiseToken[String(chainId)][1]['decimals']);
                        initialMarketCap = (totalSupply.mul(softCap).div(_uints[1]).div(parseEther('1')).mul(priceWETH).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                    }
                } else if (_addresses[2] === DefaultFundRaiseToken[String(chainId)][1]['address']) {
                    if (!_bools[1]) {
                        initialMarketCap = (totalSupply.div(dexRate)).toNumber();
                    } else {
                        initialMarketCap = (totalSupply.mul(parseUnits('1', fundRaiseTokenDecimals)).div(parseUnits('1', decimals)).div(_uints[1].mul(parseUnits('1', fundRaiseTokenDecimals)).div(parseUnits('1', decimals)).div(softCap)).div(parseUnits('1', fundRaiseTokenDecimals))).toNumber();
                    }
                } else {
                    let priceFundToken = await multicall_contract_wss.getPrice(_addresses[2]);
                    if (!_bools[1]) {
                        initialMarketCap = (totalSupply.div(dexRate).mul(priceFundToken).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                    } else {
                        initialMarketCap = (totalSupply.mul(softCap).div(_uints[1]).div(parseUnits('1', fundRaiseTokenDecimals)).mul(priceFundToken).div(parseUnits('1', DefaultFundRaiseToken[String(chainId)][1]['decimals']))).toNumber();
                    }
                }
                let pool = {
                    title,
                    address: _addresses[1],
                    owner: _addresses[0],
                    fairLaunch: _bools[1],
                    fairPresaleAmount: _uints[1].toString(),
                    weiRaised: weiRaised.toString(),
                    hardCap: hardCap.toString(),
                    softCap: softCap.toString(),
                    weiRaisedNumber: formatUnits(weiRaised, fundRaiseTokenDecimals),
                    hardCapNumber: formatUnits(hardCap, fundRaiseTokenDecimals),
                    softCapNumber: formatUnits(softCap, fundRaiseTokenDecimals),
                    presaleRate: presaleRate.toString(),
                    dexCapPercent: Number(dexCapPercent),
                    dexRate: dexRate.toString(),
                    projectTokenAddress,
                    status,
                    tier,
                    kyc,
                    startDateTime,
                    endDateTime,
                    listDateTime,
                    minAllocationPerUser: minAllocationPerUser.toString(),
                    maxAllocationPerUser: maxAllocationPerUser.toString(),
                    dexLockup: Number(dexLockup),
                    extraData,
                    ipfs,
                    isBurn: _bools[2],
                    whitelistable,
                    decimals,
                    whiteLists,
                    poolPercentFee,
                    participantsAddresses,
                    symbol,
                    name,
                    totalSupply: totalSupply.toString(),
                    audit,
                    auditLink,
                    teamVesting_amount: vestingAmount.toString(),
                    teamVesting_unlocked_amount: unlockedVestingAmount.toString(),
                    teamVesting_first_percent: firstPercent,
                    teamVesting_first_period: firstPeriod,
                    teamVesting_each_percent: eachPercent,
                    teamVesting_each_period: eachPeriod,
                    userVesting_is: userVesting.isVesting,
                    userVesting_first_percent: userVesting.firstPercent,
                    userVesting_each_percent: userVesting.eachPercent,
                    userVesting_each_period: userVesting.eachPeriod,
                    is_hide: false,
                    fundRaiseTokenAddress: _addresses[2],
                    fundRaiseTokenDecimals,
                    fundRaiseTokenSymbol,
                    fundRaiseTokenName,
                    whiteListTimer: _uints[0],
                    isTieredWhitelist: _bools[0],
                    isStealth: _bools[3],
                    userVesting_cliff: _uints[4],
                    initialMarketCap
                };
                if (pool != null) {
                    io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolCreated', {
                        pool
                    });
                    let isExisted;
                    pool.isAntiSniper=await ido_contract_wss.isAntiSniper(pool.address);
                    pool.keyForAntiSniper=await ido_contract_wss.keyForAntiSniper(pool.address);
                    try {
                        isExisted = await Pools[chainId].findOne({ address: pool.address });
                        if (isExisted) {
                            for (let ele in pool) {
                                isExisted[ele] = pool[ele];
                            }
                            await isExisted.save();
                        } else {
                            const newPool = new Pools[chainId](pool);
                            await newPool.save();
                        }
                    } catch (err) {
                        const newPool = new Pools[chainId](pool);
                        await newPool.save();
                    }
                    
                    isExisted = false;
                    if (pool.isStealth) {
                        pool.name = pool.title;
                    }
                    try {
                        isExisted = await Pools['0'].findOne({ '$and': [{ address }, { chain: Number(chainId) }] });
                        if (isExisted) {
                            for (let ele in pool) {
                                isExisted[ele] = pool[ele];
                            }
                            await isExisted.save();
                        } else {
                            pool.chain = Number(chainId);
                            const newPool = new Pools['0'](pool);
                            await newPool.save();
                        }
                    } catch (err) {
                        pool.chain = Number(chainId);
                        const newPool = new Pools['0'](pool);
                        await newPool.save();
                    }
                    
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.startDateTime) - Date.now() - 5 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "presale",
                        "5"
                    );
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.startDateTime) - Date.now() - 15 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "presale",
                        "15"
                    );
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.startDateTime) - Date.now() - 30 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "presale",
                        "30"
                    );
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.listDateTime) - Date.now() - 5 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "listing",
                        "5"
                    );
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.listDateTime) - Date.now() - 15 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "listing",
                        "15"
                    );
                    setDaysTimeout(
                        send_alarm_IDO,
                        parseInt(pool.listDateTime) - Date.now() - 30 * 60 * 1000,
                        chainId,
                        _addresses[1],
                        "listing",
                        "30"
                    );
                }
            } catch (err) {
                console.log("create err");
                console.log(err);
                return null;
            }
        })();


    });

    ido_contract_wss.on("LogPoolExtraData", (pool, extraData) => {
        (async () => {
            let ipfs = {};
            try {
                let response_ipfs;
                response_ipfs = await axios.get(
                    `https://gem.infura-ipfs.io/ipfs/${extraData}`
                );
                ipfs = response_ipfs.data;
            } catch (error) {
                console.log(error);
            }
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolExtraData', {
                pool, extraData, ipfs
            });
            await Pools[chainId].findOneAndUpdate({ address: pool }, { extraData, ipfs });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { extraData, ipfs });
        })();

    });

    ido_contract_wss.on("LogPoolTierUpdate", (pool, tier) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolTierUpdate', {
            pool, tier
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { tier: tier });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { tier: tier });
        })();
    });

    ido_contract_wss.on("LogPoolExtendLockPeriod", (pool, period) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolExtendLockPeriod', {
            pool, period
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { $inc: { dexLockup: Number(period) } });
        })();
    });

    ido_contract_wss.on("LogDeposit", (pool, participant, amount, weiRaised, decimals) => {
        (async () => {
            try{
                await Pools[chainId].findOneAndUpdate({ address: pool },
                    { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()), $addToSet: { participantsAddresses: participant } });
                const pool_=await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] },
                    { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()) });
                let trend = {};
                trend.chain = chainId;
                trend.address = pool;
                trend.marks = amount.mul(1000).div(BigNumber.from(String(pool_.minAllocationPerUser))).toNumber();
                const newTrend = new Trend(trend);
                await newTrend.save();
            }catch(err){
                console.log(err);
            }

            // await pool_.addParticipant(participant);
        })();
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogDeposit', {
            pool, participant, weiRaised, decimals
        });

    });

    ido_contract_wss.on("LogEmergencyWithdraw", (pool, participant, amount, weiRaised, decimals) => {
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool },
                { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()), $pull: { participantsAddresses: participant } });
            const pool_=await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] },
                { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()) });
            let trend = {};
            trend.chain = chainId;
            trend.address = pool;
            trend.marks = -(amount.div(pool_.minAllocationPerUser).mul(1000).toNumber());
            const newTrend = new Trend(trend);
            await newTrend.save();
        })();
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogEmergencyWithdraw', {
            pool, participant, weiRaised, decimals
        });
    });

    ido_contract_wss.on("LogPoolStatusChanged", (pool, status) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolStatusChanged', {
            pool, status
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { status: status });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] }, { status: status });
        })();

    });

    ido_contract_wss.on("TierAllowed", (pool, noTier) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':TierAllowed', {
            pool, noTier
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { noTier: noTier });
        })();

    });

    ido_contract_wss.on("LogPoolStatusChangedWithFillup", (pool, status, projectTokenAddress, presaleRate, dexRate, vestingAmount,
        unlockedVestingAmount, fairPresaleAmount) => {

        (async () => {
            let erc20_contract = new ethers.Contract(
                projectTokenAddress,
                erc20_abi,
                ethers_wss
            );


            const decimals = await erc20_contract.decimals();
            const totalSupply = await erc20_contract.totalSupply();

            const symbol = await erc20_contract.symbol();
            const name = await erc20_contract.name();
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolStatusChangedWithFillup', {
                pool, status, projectTokenAddress, decimals, totalSupply: totalSupply.toString(), symbol, name,
                presaleRate: presaleRate.toString(),
                dexRate: dexRate.toString(),
                teamVesting_amount: vestingAmount.toString(),
                teamVesting_unlocked_amount: unlockedVestingAmount.toString(),
                fairPresaleAmount: fairPresaleAmount.toString()
            });
            await Pools[chainId].findOneAndUpdate({ address: pool },
                {
                    status: status, projectTokenAddress, decimals, totalSupply: totalSupply.toString(), symbol, name,
                    presaleRate: presaleRate.toString(),
                    dexRate: dexRate.toString(),
                    teamVesting_amount: vestingAmount.toString(),
                    teamVesting_unlocked_amount: unlockedVestingAmount.toString(),
                    fairPresaleAmount: fairPresaleAmount.toString()
                });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] },
                {
                    status: status, projectTokenAddress, decimals, totalSupply: totalSupply.toString(), symbol, name,
                    presaleRate: presaleRate.toString(),
                    dexRate: dexRate.toString(),
                    fairPresaleAmount: fairPresaleAmount.toString()
                });
        })();

    });

    ido_contract_wss.on(
        "LogUpdateWhitelistable",
        (pool, whitelistable) => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogUpdateWhitelistable', {
                pool, whitelistable
            });
            (async () => {
                if (whitelistable[0] && whitelistable[1]) {
                    await Pools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1], whiteListTimer: 10 }
                    );
                    await Pools['0'].findOneAndUpdate(
                        { '$and': [{ address: pool }, { chain: Number(chainId) }] },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1] }
                    );
                } else if (whitelistable[0] && !whitelistable[1]) {
                    await Pools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1], whiteListsForTiered: [], whiteListTimer: 10 }
                    );
                    await Pools['0'].findOneAndUpdate(
                        { '$and': [{ address: pool }, { chain: Number(chainId) }] },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1] }
                    );
                } else {
                    await Pools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1], whiteLists: [], whiteListsForTiered: [], whiteListTimer: 10 }
                    );
                    await Pools['0'].findOneAndUpdate(
                        { '$and': [{ address: pool }, { chain: Number(chainId) }] },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1] }
                    );
                }
            })();

        }
    );

    // ido_contract_wss.on("LogPoolRemoved", async (pool) => {
    //   await Pools[chainId].deleteOne({ address: pool });
    // });

    ido_contract_wss.on(
        "LogAddressWhitelisted",
        (pool, whitelistedAddresses, whitelistedAddressesForTiered) => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogAddressWhitelisted', {
                pool, whitelistedAddresses, whitelistedAddressesForTiered
            });
            (async () => {
                await Pools[chainId].findOneAndUpdate(
                    { address: pool },
                    { $addToSet: { whiteLists: { $each: whitelistedAddresses }, whiteListsForTiered: { $each: whitelistedAddressesForTiered } } }
                );
            })();
        }
    );
    ido_contract_wss.on("LogPoolUnlockVestingToken", (pool, unlockedVestingAmount) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolUnlockVestingToken', {
            pool, unlockedVestingAmount
        });
        (async () => {
            try {
                await Pools[chainId].findOneAndUpdate(
                    { address: pool },
                    { teamVesting_unlocked_amount: unlockedVestingAmount.toString() }
                );
            } catch (err) {
                console.log(err);
            }
        })();
    });
    ido_contract_wss.on("LogPoolHide", (pool, isHide) => {
        console.log("hide " + pool);
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolHide', {
            pool: pool, isHide
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { is_hide: isHide });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] },
                { is_hide: isHide });
        })();
    });
    ido_contract_wss.on("LogPoolWhiteListTimerChanged", (pool, whiteListTimer) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolWhiteListTimerChanged', {
            pool, whiteListTimer
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { whiteListTimer: whiteListTimer });
        })();
    });
    ido_contract_wss.on("LogPoolListDateTimerChanged", (pool, listDateTime) => {
        listDateTime = Number(listDateTime);
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':LogPoolListDateTimerChanged', {
            pool, listDateTime: listDateTime * 1000
        });
        (async () => {
            await Pools[chainId].findOneAndUpdate({ address: pool }, { listDateTime: listDateTime * 1000, endDateTime: listDateTime * 1000 });
            await Pools['0'].findOneAndUpdate({ '$and': [{ address: pool }, { chain: Number(chainId) }] },
                { listDateTime: listDateTime * 1000, endDateTime: listDateTime * 1000 });
        })();
    });
};

module.exports = { get_IDOs, event_IDOs };


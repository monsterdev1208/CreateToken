const specialSale_abi = require("../abi/specialSale.json");
const ethers = require("ethers");
const erc20_abi = require("../abi/erc20.json");
const { SPECIALSALE_ADDRESS, NETWORK_SYMBOL, CHAIN_IDS } = require("../config/constants");
const { formatEther, formatUnits } = require('@ethersproject/units');
const { AddressZero } = require("@ethersproject/constants");
const setDaysTimeout = require('../utils/setDaysTimeout');

const axios = require('axios');
const SpecialPools = {};

for (const ele of CHAIN_IDS[process.env.NETWORK_MODE]) {
    SpecialPools[ele] = require("../models/SpecialPool_" + NETWORK_SYMBOL[ele].toUpperCase());
}



const get_SpecialSale_Pool = async (address, _specialSale_contract_wss, _ethers_wss) => {
    try {
        const owner = await _specialSale_contract_wss.poolOwners(address);
        let is_hide = false;
        try {
            is_hide = await _specialSale_contract_wss.isHiddenPool(address);
        } catch (err) { }
        const userVesting_cliff = await _specialSale_contract_wss.cliff(address);
        const isAdminSale = await _specialSale_contract_wss.isAdminSale(address);
        let {
            hardCap,
            softCap,
            specialSaleRate,
            projectTokenAddress,
            startDateTime,
            endDateTime,
            minAllocationPerUser,
            maxAllocationPerUser,
            status
        } = await _specialSale_contract_wss.poolInformation(address);
        let {
            extraData,
            whitelistable,
            audit,
            auditLink,
            tier,
            kyc
        } = await _specialSale_contract_wss.poolDetails(address);
        let userVesting;
        try {
            userVesting = await _specialSale_contract_wss.userVesting(address);
        } catch (err) {
            userVesting = {
                isVesting: false,
                firstPercent: 0,
                eachPercent: 0,
                eachPeriod: 0
            };
        }
        const noTier= await _specialSale_contract_wss.noTier(address);
        let isTieredWhitelist = await _specialSale_contract_wss.isTieredWhitelist(address);
        startDateTime = startDateTime * 1000;
        endDateTime = endDateTime * 1000;
        let decimals, totalSupply, symbol, name;
        if (projectTokenAddress != AddressZero) {
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
        let allowDateTime = 1000 * (await _specialSale_contract_wss.allowDateTime(address));
        let fundRaiseTokenAddress = await _specialSale_contract_wss.fundRaiseToken(address);
        let fundRaiseTokenDecimals = await _specialSale_contract_wss.fundRaiseTokenDecimals(address);
        fundRaiseTokenDecimals = fundRaiseTokenDecimals && fundRaiseTokenDecimals > 0 ? fundRaiseTokenDecimals : 18;
        let fundRaiseTokenName;
        let fundRaiseTokenSymbol;
        if (fundRaiseTokenAddress != AddressZero) {
            const erc20_contract = new ethers.Contract(
                fundRaiseTokenAddress,
                erc20_abi,
                _ethers_wss
            );
            fundRaiseTokenName = await erc20_contract.name();
            fundRaiseTokenSymbol = await erc20_contract.symbol();
        }
        const weiRaised = await _specialSale_contract_wss._weiRaised(address);



        const whiteLists = [], participantsAddresses = [], whiteListsForTiered = [];

        if (whitelistable) {
            let k = 0;
            while (true) {
                try {
                    const whiteList = await _specialSale_contract_wss.whitelistedAddressesArray(address, k);
                    whiteLists.push(whiteList);
                } catch (err) {
                    break;
                }
                k++;
            }
        }
        if (isTieredWhitelist) {
            let k = 0;
            while (true) {
                try {
                    const whiteList = await _specialSale_contract_wss.whitelistedAddressesArrayForTiered(address, k);
                    whiteListsForTiered.push(whiteList);
                } catch (err) {
                    break;
                }
                k++;
            }
        }
        let k = 0;
        while (true) {
            try {
                const participantsAddress = await _specialSale_contract_wss.participantsAddress(address, k);
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
            // console.log(error);
        }
        const pool = {
            address,
            owner,
            weiRaised: weiRaised.toString(),
            hardCap: hardCap.toString(),
            softCap: softCap.toString(),
            weiRaisedNumber: formatUnits(weiRaised, fundRaiseTokenDecimals),
            hardCapNumber: formatUnits(hardCap, fundRaiseTokenDecimals),
            softCapNumber: formatUnits(softCap, fundRaiseTokenDecimals),
            specialSaleRate: specialSaleRate.toString(),
            projectTokenAddress,
            status,
            tier,
            kyc,
            noTier,
            startDateTime,
            endDateTime,
            minAllocationPerUser: minAllocationPerUser.toString(),
            maxAllocationPerUser: maxAllocationPerUser.toString(),
            extraData,
            ipfs,
            // refund,
            whitelistable,
            decimals,
            whiteLists,
            participantsAddresses,
            symbol,
            name,
            totalSupply: totalSupply ? totalSupply.toString() : "",
            audit,
            auditLink,
            userVesting_is: userVesting.isVesting,
            userVesting_first_percent: userVesting.firstPercent,
            userVesting_each_percent: userVesting.eachPercent,
            userVesting_each_period: userVesting.eachPeriod,
            userVesting_cliff,
            is_hide,
            isAdminSale,
            allowDateTime,
            fundRaiseTokenAddress,
            fundRaiseTokenDecimals,
            fundRaiseTokenSymbol,
            fundRaiseTokenName,
            isTieredWhitelist,
            whiteListsForTiered
        };
        return pool;

    } catch (err) {
        return null;
    }
};

const get_SpecialSales = async (ethers_wss, send_alarm_specialSale, chainId) => {
    const specialSale_contract_wss = new ethers.Contract(
        SPECIALSALE_ADDRESS[chainId],
        specialSale_abi,
        ethers_wss
    );
    let i = 0;
    // await SpecialPools[chainId].deleteMany({});
    while (true) {
        try {
            const address = await specialSale_contract_wss.poolAddresses(i);
            const pool = await get_SpecialSale_Pool(address, specialSale_contract_wss, ethers_wss);
            if (pool != null) {
                let isExisted;
                try{
                    isExisted=await SpecialPools[chainId].findOne({address});
                }catch(err){}
                if(isExisted){
                    for(let ele in pool){
                        isExisted[ele]=pool[ele];
                    }
                    await isExisted.save();
                }else{
                    const newPool = new SpecialPools[chainId](pool);
                    await newPool.save();
                }
                setDaysTimeout(
                    send_alarm_specialSale,
                    parseInt(pool.startDateTime) - Date.now() - 5 * 60 * 1000,
                    chainId,
                    address,
                    "specialSale",
                    "5"
                );
                setDaysTimeout(
                    send_alarm_specialSale,
                    parseInt(pool.startDateTime) - Date.now() - 15 * 60 * 1000,
                    chainId,
                    address,
                    "specialSale",
                    "15"
                );
                setDaysTimeout(
                    send_alarm_specialSale,
                    parseInt(pool.startDateTime) - Date.now() - 30 * 60 * 1000,
                    chainId,
                    address,
                    "specialSale",
                    "30"
                );
            }
        } catch (err) {
            break;
        }
        i++;
    }
};

const event_SpecialSales = (ethers_wss, send_alarm_specialSale, io, chainId) => {
    const specialSale_contract_wss = new ethers.Contract(
        SPECIALSALE_ADDRESS[chainId],
        specialSale_abi,
        ethers_wss
    );

    specialSale_contract_wss.on("LogPoolKYCUpdate", (pool, kyc) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolKYCUpdate', {
            pool, kyc
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { kyc: kyc });
        })();
    });
    specialSale_contract_wss.on(
        "LogPoolAuditUpdate",
        (pool, audit, auditLink) => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolAuditUpdate', {
                pool, audit, auditLink
            });
            (async () => {
                await SpecialPools[chainId].findOneAndUpdate(
                    { address: pool },
                    { audit: audit, auditLink: auditLink }
                );
            })();
        }
    );
    specialSale_contract_wss.on("LogPoolCreated", (poolOwner, pool_address, model, details, userVesting,
        cliff, isAdminSale, isTieredWhitelist, fundRaiseTokenAddress, fundRaiseTokenDecimals, allowDateTime) => {
        (async () => {
            try {
                allowDateTime = allowDateTime * 1000;
                let ipfs = {};
                const weiRaised = 0;
                let {
                    hardCap,
                    softCap,
                    specialSaleRate,
                    projectTokenAddress,
                    startDateTime,
                    endDateTime,
                    minAllocationPerUser,
                    maxAllocationPerUser,
                    status
                } = model;
                let {
                    extraData,
                    whitelistable,
                    audit,
                    auditLink,
                    tier,
                    kyc
                } = details;
                fundRaiseTokenDecimals = fundRaiseTokenDecimals && fundRaiseTokenDecimals > 0 ? fundRaiseTokenDecimals : 18;
                startDateTime = startDateTime * 1000;
                endDateTime = endDateTime * 1000;
                let decimals, totalSupply, symbol, name;
                if (projectTokenAddress != AddressZero) {
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


                let fundRaiseTokenName;
                let fundRaiseTokenSymbol;
                if (fundRaiseTokenAddress != AddressZero) {
                    const erc20_contract = new ethers.Contract(
                        fundRaiseTokenAddress,
                        erc20_abi,
                        ethers_wss
                    );
                    fundRaiseTokenName = await erc20_contract.name();
                    fundRaiseTokenSymbol = await erc20_contract.symbol();
                }

                const whiteLists = [], participantsAddresses = [];



                try {
                    let response_ipfs;
                    response_ipfs = await axios.get(
                        `https://gem.infura-ipfs.io/ipfs/${extraData}`
                    );
                    ipfs = response_ipfs.data;
                } catch (error) {
                    // console.log(error);
                }
                const pool = {
                    address: pool_address,
                    owner: poolOwner,
                    weiRaised: weiRaised.toString(),
                    hardCap: hardCap.toString(),
                    softCap: softCap.toString(),
                    weiRaisedNumber: formatUnits(weiRaised, fundRaiseTokenDecimals),
                    hardCapNumber: formatUnits(hardCap, fundRaiseTokenDecimals),
                    softCapNumber: formatUnits(softCap, fundRaiseTokenDecimals),
                    specialSaleRate: specialSaleRate.toString(),
                    projectTokenAddress,
                    status,
                    tier,
                    kyc,
                    startDateTime,
                    endDateTime,
                    minAllocationPerUser: minAllocationPerUser.toString(),
                    maxAllocationPerUser: maxAllocationPerUser.toString(),
                    extraData,
                    ipfs,
                    // refund,
                    whitelistable,
                    decimals,
                    whiteLists,
                    participantsAddresses,
                    symbol,
                    name,
                    totalSupply: totalSupply ? totalSupply.toString() : "",
                    audit,
                    auditLink,
                    userVesting_is: userVesting.isVesting,
                    userVesting_first_percent: userVesting.firstPercent,
                    userVesting_each_percent: userVesting.eachPercent,
                    userVesting_each_period: userVesting.eachPeriod,
                    userVesting_cliff: cliff,
                    is_hide: false,
                    isAdminSale,
                    allowDateTime,
                    fundRaiseTokenAddress,
                    fundRaiseTokenDecimals,
                    fundRaiseTokenSymbol,
                    fundRaiseTokenName,
                    isTieredWhitelist
                };
                if (pool != null) {
                    io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolCreated', {
                        pool
                    });

                    let isExisted;
                    try{
                        isExisted=await SpecialPools[chainId].findOne({address:pool.address});
                    }catch(err){}
                    if(isExisted){
                        for(let ele in pool){
                            isExisted[ele]=pool[ele];
                        }
                        await isExisted.save();
                    }else{
                        const newPool = new SpecialPools[chainId](pool);
                        await newPool.save();
                    }
                    
                    setDaysTimeout(
                        send_alarm_specialSale,
                        parseInt(pool.startDateTime) - Date.now() - 5 * 60 * 1000,
                        chainId,
                        pool_address,
                        "specialSale",
                        "5"
                    );
                    setDaysTimeout(
                        send_alarm_specialSale,
                        parseInt(pool.startDateTime) - Date.now() - 15 * 60 * 1000,
                        chainId,
                        pool_address,
                        "specialSale",
                        "15"
                    );
                    setDaysTimeout(
                        send_alarm_specialSale,
                        parseInt(pool.startDateTime) - Date.now() - 30 * 60 * 1000,
                        chainId,
                        pool_address,
                        "specialSale",
                        "30"
                    );
                }
            } catch (err) {
                console.log(err);
                return null;
            }
        })();
    });

    specialSale_contract_wss.on("LogPoolExtraData", (pool, extraData) => {
        (async () => {
            let ipfs = {};
            try {
                let response_ipfs;
                response_ipfs = await axios.get(
                    `https://gem.infura-ipfs.io/ipfs/${extraData}`
                );
                ipfs = response_ipfs.data;
            } catch (error) {
                // console.log(error);
            }
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolExtraData', {
                pool, extraData, ipfs
            });
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { extraData, ipfs });
        })();
    });
    specialSale_contract_wss.on("LogAdminPoolFilled", (sender, pool, projectTokenAddress,
        decimals, totalSupply, symbol, name) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogAdminPoolFilled', {
            pool, projectTokenAddress,
            decimals, totalSupply, symbol, name
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { projectTokenAddress, decimals, totalSupply: totalSupply.toString(), symbol, name });
        })();
    });
    specialSale_contract_wss.on("LogPoolTierUpdate", (pool, tier) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolTierUpdate', {
            pool, tier
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { tier: tier });
        })();
    });
    specialSale_contract_wss.on("LogDeposit", (pool, participant, weiRaised, decimals) => {

        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool },
                { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()), $addToSet: { participantsAddresses: participant } });

        })();
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogDeposit', {
            pool, participant, weiRaised, decimals
        });
    });

    specialSale_contract_wss.on("TierAllowed", (pool, noTier) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:TierAllowed', {
            pool, noTier
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { noTier: noTier });
        })();

    });
    specialSale_contract_wss.on("LogEmergencyWithdraw", (pool, participant, weiRaised, decimals) => {
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool },
                { weiRaised: weiRaised.toString(), weiRaisedNumber: formatUnits(weiRaised, decimals.toString()), $pull: { participantsAddresses: participant } });
        })();
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogEmergencyWithdraw', {
            pool, participant, weiRaised, decimals
        });
    });
    specialSale_contract_wss.on("LogPoolStatusChanged", (pool, status) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolStatusChanged', {
            pool, status
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { status: status });
        })();
    });

    specialSale_contract_wss.on("LogUpdateAllowDateTime", (pool, allowDateTime) => {
        allowDateTime = allowDateTime * 1000;
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogUpdateAllowDateTime', {
            pool, allowDateTime
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { allowDateTime: allowDateTime });
        })();
    });

    specialSale_contract_wss.on(
        "LogUpdateWhitelistable",
        (pool, whitelistable) => {
            io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogUpdateWhitelistable', {
                pool, whitelistable
            });
            (async () => {
                if (whitelistable[0] && whitelistable[1])
                    await SpecialPools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1] }
                    );
                else if (whitelistable[0] && !whitelistable[1])
                    await SpecialPools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1], whiteListsForTiered: [] }
                    );
                else
                    await SpecialPools[chainId].findOneAndUpdate(
                        { address: pool },
                        { whitelistable: whitelistable[0], isTieredWhitelist: whitelistable[1], whiteLists: [], whiteListsForTiered: [] }
                    );
            })();
        }
    );

    // specialSale_contract_wss.on("LogPoolRemoved", async (pool) => {
    //   await SpecialPools[chainId].deleteOne({ address: pool });
    // });

    specialSale_contract_wss.on(
        "LogAddressWhitelisted",
        (pool, whitelistedAddresses, whitelistedAddressesForTiered) => {
            (async () => {
                io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogAddressWhitelisted', {
                    pool, whitelistedAddresses, whitelistedAddressesForTiered
                });
                await SpecialPools[chainId].findOneAndUpdate(
                    { address: pool },
                    { $addToSet: { whiteLists: { $each: whitelistedAddresses }, whiteListsForTiered: { $each: whitelistedAddressesForTiered } } }
                );
            })();
        }
    );

    specialSale_contract_wss.on("LogPoolHide", (pool, isHide) => {
        io.emit('launchpad:' + NETWORK_SYMBOL[chainId] + ':specialSale:LogPoolHide', {
            pool, isHide
        });
        (async () => {
            await SpecialPools[chainId].findOneAndUpdate({ address: pool }, { is_hide: isHide });
        })();

    });
};

module.exports = {get_SpecialSales, event_SpecialSales};
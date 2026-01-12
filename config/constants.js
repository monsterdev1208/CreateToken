const { AddressZero } = require("@ethersproject/constants");

const SPECIALSALE_ADDRESS = {
    "1": '0x1E7Df564D0E1a9bA0905C0a9De6A73dd1DFba06E',
    "56": '0x5354583077bb19aA9b68549F3f81B8626972ce72',
    "3": '0x3FBE8255331255cF4d1966dcb42263180311da5C',
    "97": '0x988a0Ce122255cAa59929d9e44b87AA9C26C25a0',
    "40": '0x0433682910b0D1e06F484290e9Ad2640BFfE19c8',
    "137": '0x975209f9738Cbc96C638F10cb46669eaA4655919',
    "25": '0x01EAF07020fF04370006ef89e73fda25CAC640a9',
    "2000":"0x5ae1fedBfFBe251484821eB80AE0e67b837423d6"
};

const IDO_ADDRESS = {
    "1": '0xC7B61288DCAb9ceb2F9784ECe0f48A083A337171',
    "56": '0x476F879CAC05c2976e0DCC7789406292B2f14E96',
    "3": '0x44D8a5be5830FB83d3BEeA3B94F5A18c95229E76',
    "97": '0x3bAc3D8c81Ed08C3250c6196e017716960eECb1D',
    "40": '0xDA84db87e657945d5A7B40c75746FfbB26f69aBF',
    "137": '0x19B7e1C218C00323A648cA738F387C555Fdf7baB',
    "25": '0xb02b1Fb0fB04b4D65D82742324B69256674B95Ca',
    "52":"",
    "2000":"0x4073f1aE6e4B908F9575c0A82358E64680Da1668"
};

const LOCK_ADDRESS = {
    "1": '0x98cBfc7763c8c0a9525154D4C376014A4d00eE83',
    "56": '0x1aEd86440B5065D523302d9fE1Dd24B9044482E3',
    "3": '0xdd151CEbdc9574686a408381732a5756D4A96819',
    "97": '0x7873cbF688ceDd8770B804cef096Eb84f01FfeDa',
    "40": '0x2513f77383A4FAb0732102d043c3EF18AD660117',
    "137": '0xEFbB917893d8D6Edea7D256ef7ee397Fc8C2369e',
    "25": '0xEFbB917893d8D6Edea7D256ef7ee397Fc8C2369e',
    "52":"",
    "2000":"0xBcC9cb7373A806D6A33619A8AB4DF4f5536dd7cA"
};

const NETWORK_SYMBOL = {
    "1": "eth",
    "3": "eth",
    "56": "bsc",
    "97": "bsc",
    "40": "tlos",
    "137": 'polygon',
    "25": 'cro',
    "52":"cet",
    "2000":"doge"
};

const NETWORK_IDS = {
    "testnet": {
        "eth": "3",
        "bsc": "97"
    },
    "mainnet": {
        "eth": "1",
        "bsc": "56",
        "tlos": "40",
        "polygon": "137",
        "cro": "25",
        "cet":"52",
        "doge":"2000"
    }
};

const HTTPS_ENDPOINTS = {
    "1": "https://cloudflare-eth.com",
    "3": "https://eth-ropsten.alchemyapi.io/v2/zT6MSYFVB-ojEc0-BbokQELJKOl0YxdS",
    "56": "https://bsc-dataseed.binance.org/",
    "97": "https://data-seed-prebsc-1-s1.binance.org:8545/",
    "40": "https://rpc1.eu.telos.net/evm",
    "137": "https://polygon-rpc.com/",
    "25": "https://evm.cronos.org",
    "52": "https://rpc.coinex.net/",
    "2000":"https://rpc-sg.dogechain.dog"
};

const ADMIN_ADDRESS = {
    "1": '0x54E7032579b327238057C3723a166FBB8705f5EA',
    "56": '0x54E7032579b327238057C3723a166FBB8705f5EA',
    "3": '0x4984aefC02674b60D40ef57FAA158140AE69c0a8',
    "97": '0x4984aefC02674b60D40ef57FAA158140AE69c0a8',
    "40": '0x54E7032579b327238057C3723a166FBB8705f5EA',
    "137": '0x54E7032579b327238057C3723a166FBB8705f5EA',
    "25": '0x54E7032579b327238057C3723a166FBB8705f5EA',
    "52": '',
    "2000":"0x415A1adA879DD793d4168f28484dE51D66FF6E1c"
};
const WSS_ENDPOINTS = {
    "1": ["wss://speedy-nodes-nyc.moralis.io/a10eefa668498184b33afab6/eth/mainnet/ws"],
    "3": ["wss://eth-ropsten.alchemyapi.io/v2/zT6MSYFVB-ojEc0-BbokQELJKOl0YxdS"],
    "56": ["wss://speedy-nodes-nyc.moralis.io/a10eefa668498184b33afab6/bsc/mainnet/ws",
    "wss://old-bitter-paper.bsc.quiknode.pro/137b755cb459460c4b0d204f4bde6a7c2312f59f/"
        ],
    "97": ["wss://speedy-nodes-nyc.moralis.io/a10eefa668498184b33afab6/bsc/testnet/ws",
        "wss://bsc.getblock.io/testnet/?api_key=1336a18d-568d-4b68-aa2c-f6629bc283b1"],
    "40": ["https://rpc1.eu.telos.net/evm"],
    "137": ["wss://ws-matic-mainnet.chainstacklabs.com"], // ["wss://speedy-nodes-nyc.moralis.io/a10eefa668498184b33afab6/polygon/mainnet/ws"],
    "25": ["https://mmf-rpc.xstaking.sg"],
    "52":["wss://csc-ws.coinex.net/"],
    "2000":[]
};
const MULTICALL_ADDRESS = {
    "1": '0xA9013F9f840db3542B5b6C78c45bCB795DF88a26',
    "56": '0x66E1CE5F356B7a5D35A623Afac8031A0E3D737E4',
    "3": '',
    "97": '0x5b0fe97189BCed31195BeC3f7E922fE60506eFED',
    "40": '0x005aDD28f7f33a20e17B5c137B13Fe8f074Ac3Fc',
    "137": '0x77E18Be2c652bC8C35266D85ed1Fad36D452e6Bc',
    "25": '0x26ca529BE03eC59256e0E0B976be2c539c6BC848',
    "52": '',
    "2000": "0x017e6d7ffb9b9c7e93De53596673485A3923c4bc"
};
const WETH_ADDRESS = {
    "1": '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    "56": '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    "3": '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    "97": '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    "40": '0xd102ce6a4db07d247fcc28f366a623df0938ca9e',
    "137": '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    "25": '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    "52": '0xE6f8988d30614afE4F7124b76477Add79c665822',
    "2000":"0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101" 
};

const DefaultFundRaiseToken = {
    "1": [
        {
            "address": AddressZero,
            "symbol": "ETH",
            "decimals": 18
        },
        {
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "name": "USDT",
            "decimals": 6
        }
    ],
    "56": [
        {
            "address": AddressZero,
            "symbol": "BNB",
            "decimals": 18
        },
        {
            "address": "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            "symbol": "BUSD",
            "decimals": 18
        }
    ],
    "3": [
        {
            "address": AddressZero,
            "symbol": "ETH",
            "decimals": 18
        },
        {
            "address": "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83",
            "symbol": "USDT",
            "decimals": 6
        }
    ],
    "97": [
        {
            "address": AddressZero,
            "symbol": "BNB",
            "decimals": 18
        },
        {
            "address": "0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47",
            "symbol": "BUSD",
            "decimals": 18
        }
    ],
    "40": [
        {
            "address": AddressZero,
            "symbol": "TLOS",
            "decimals": 18
        },
        {
            "address": "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73",
            "symbol": "USDT",
            "decimals": 6
        }
    ],
    "137": [
        {
            "address": AddressZero,
            "symbol": "MATIC",
            "decimals": 18
        },
        {
            "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            "symbol": "USDT",
            "decimals": 6
        }
    ],
    "25": [
        {
            "address": AddressZero,
            "symbol": "CRO",
            "decimals": 18
        },
        {
            "address": "0x66e428c3f67a68878562e79A0234c1F83c208770",
            "symbol": "USDT",
            "decimals": 6
        }
    ],
    "52": [
        {
            "address": AddressZero,
            "symbol": "CET",
            "decimals": 18
        },
        {
            "address": "0x398dcA951cD4fc18264d995DCD171aa5dEbDa129",
            "symbol": "USDT",
            "decimals": 18
        }
    ],
    "2000": [
        {
            "address": AddressZero,
            "symbol": "DOGE",
            "decimals": 18
        },
        {
            "address": "0x765277EebeCA2e31912C9946eAe1021199B39C61",
            "symbol": "USDC",
            "decimals": 6
        }
    ]
};
const CHAIN_IDS = {
    "testnet": [
        "97"
        //    "3"
    ],
    "mainnet": [
        "1",
        "56",
        "40",
        "137",
        "25",
        // "52",
        "2000"
    ]
};
const DOMAIN_NAME={
    "testnet":["testnet.gempad.app"],
    "mainnet": ["gempad.app", "www.gempad.app"]
}
module.exports = {
    DOMAIN_NAME,
    IDO_ADDRESS,
    SPECIALSALE_ADDRESS,
    LOCK_ADDRESS,
    NETWORK_SYMBOL,
    NETWORK_IDS,
    HTTPS_ENDPOINTS,
    WSS_ENDPOINTS,
    CHAIN_IDS,
    MULTICALL_ADDRESS, DefaultFundRaiseToken,WETH_ADDRESS,
    ADMIN_ADDRESS
}

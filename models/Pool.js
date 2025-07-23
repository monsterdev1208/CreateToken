const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BigNumberSchema = require('mongoose-bignumber')
const BigNumber = require('bignumber.js')

// Create Schema
const Pool_Schema = new Schema(
  {
    chain:{
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true,
    },
    fairLaunch:{
      type: Boolean
    },
    fairPresaleAmount:{
      type: BigNumberSchema   
    },
    weiRaised: {
      type: BigNumberSchema,
      required: true   
    },    
    minAllocationPerUser: {
      type: BigNumberSchema,
      required: true      
    },
    hardCap: {
      type: BigNumberSchema,
      required: true      
    },
    softCap: {
      type: BigNumberSchema,
      required: true
    },
    weiRaisedNumber: {
      type: Number,
      required: true
    },
    hardCapNumber: {
      type: Number,
      required: true
    },
    softCapNumber: {
      type: Number,
      required: true
    },
    is_hide:{
      type:Boolean
    },
    presaleRate: {
      type: BigNumberSchema,
      required: true
    },
    dexRate: {
      type: BigNumberSchema,
      required: true    
    },
    projectTokenAddress: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    kyc: {
      type: Boolean
    },
    audit: {
      type: Boolean
    },
    auditLink: {
      type: String
    },
    startDateTime: {
      type: Date,
    },
    endDateTime: {
      type: Date,
    },
    listDateTime: {
      type: Date,
    },
    isBurn: {
      type: Boolean
    },
    whitelistable: {
      type: Boolean
    },
    decimals: {
      type: String,
    },
    poolPercentFee: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    symbol: {
      type: String,
    },
    totalSupply: {
      type: BigNumberSchema
    },
   
    ipfs:{
      isBannerVideo:{type:Boolean},
      banner:{
        type:String
      },
      logo:{
        type:String
      },
      website:{
        type:String
      },
      twitter:{
        type:String
      },
      github:{
        type:String
      },
      telegram:{
        type:String
      },
      discord:{
        type:String
      },
      youtube:{
        type:String
      },
      whitelistLink:{
        type:String
      },
      description:{
        type:String
      }      
    },
 
    fundRaiseTokenAddress:{
      type:String
    },
    fundRaiseTokenDecimals:{
      type:Number
    },
    fundRaiseTokenName:{
      type:String
    },
    fundRaiseTokenSymbol:{
      type:String
    },    
    isTieredWhitelist:{
      type:Boolean
    },    
    isStealth:{
      type:Boolean
    },
    safu:{
      type:Boolean
    },   
    initialMarketCap:{
      type: Number,
      required: true
    },
    buyTax:{
      type:Number
    },
    sellTax:{
      type:Number
    },
    twitterFollowers:{
      type:Number
    },
    telegramOnline:{
      type:Number
    },
    telegramMembers:{
      type:Number
    },
    isAntiSniper:{
      type:Boolean
    },
    keyForAntiSniper:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);
Pool_Schema.set('toJSON', { getters: true });
Pool_Schema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj.__v;
  delete obj._id;
  return obj;
};

module.exports = Pool = mongoose.model("pool", Pool_Schema);

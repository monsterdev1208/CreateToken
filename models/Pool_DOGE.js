const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BigNumberSchema = require('mongoose-bignumber')
const BigNumber = require('bignumber.js')

// Create Schema
const Pool_DOGESchema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique:true
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
    presaleRate: {
      type: BigNumberSchema,
      required: true
    },
    dexCapPercent: {
      type: Number,
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
    minAllocationPerUser: {
      type: BigNumberSchema,
      required: true      
    },
    maxAllocationPerUser: {
      type: BigNumberSchema,
      required: true
    },
    dexLockup: {
      type: Number,
      required: true,
    },
    extraData: {
      type: String,
      required: true,
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
    whiteLists: {
      type: Array,
    },
    participantsAddresses: {
      type: Array
    },
    alarms:{
      type: Array
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
    holders:{
      type:Object
    },
    teamVesting_amount:{
      type:BigNumberSchema
    },
    teamVesting_unlocked_amount:{
      type:BigNumberSchema
    },
    teamVesting_first_percent:{
      type:Number
    },
    teamVesting_first_period:{
      type:Number
    },
    teamVesting_each_percent:{
      type:Number
    },
    teamVesting_each_period:{
      type:Number
    },
    userVesting_is:{
      type:Boolean
    },
    userVesting_first_percent:{
      type:Number
    },   
    userVesting_each_percent:{
      type:Number
    },
    userVesting_each_period:{
      type:Number
    },
    lock_addresses:{
      type:Array
    },
    is_hide:{
      type:Boolean
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
    whiteListTimer:{
      type:Number
    },
    isTieredWhitelist:{
      type:Boolean
    },
    whiteListsForTiered:{
      type:Array
    },
    isStealth:{
      type:Boolean
    },
    title:{
      type:String
    },
    favorites: {
      type: Array
    },
    safu:{
      type:Boolean
    },
    userVesting_cliff:{
      type:Number
    },
    direction:{
      type:Number
    },
    prevTrend:{
      type:Number
    },
    score:{
      type:Number,
      default:0
    },
    noTier:{
      type:Boolean,
      default:false
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
Pool_DOGESchema.set('toJSON', { getters: true });
Pool_DOGESchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj.__v;
  delete obj._id;
  return obj;
};
module.exports = Pool_DOGE = mongoose.model("pool_doge", Pool_DOGESchema);

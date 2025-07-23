const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BigNumberSchema = require('mongoose-bignumber');
const BigNumber = require('bignumber.js');
// Create Schema
const SpecialPool_CROSchema = new Schema(
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
    specialSaleRate: {
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
    minAllocationPerUser: {
      type: BigNumberSchema,
      required: true
    },
    maxAllocationPerUser: {
      type: BigNumberSchema,
      required: true
    },
    extraData: {
      type: String,
      required: true,
    },
    // refund: {
    //   type: Boolean
    // },
    whitelistable: {
      type: Boolean
    },
    decimals: {
      type: String,
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
      type: Array,
    },
    alarms:{
      type: Array
    },
    ipfs:{
      title:{
        type:String
      },
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
      },
      presaleRate:{
        type: Number
      },      
      dexRate:{
        type: Number
      }
    },
    holders:{
      type:Object
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
    userVesting_cliff:{
      type:Number
    },
    lock_addresses:{
      type:Array
    },
    is_hide:{
      type:Boolean
    },
    isAdminSale:{
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
    allowDateTime:{
      type:Date
    },
    isTieredWhitelist:{
      type:Boolean
    },
    whiteListsForTiered:{
      type:Array
    },
    favorites: {
      type: Array
    },
    noTier:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  }
);
SpecialPool_CROSchema.set('toJSON', { getters: true });
SpecialPool_CROSchema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj.__v;
  delete obj._id;
  return obj;
};
module.exports = SpecialPool_CRO = mongoose.model("specialpool_cro", SpecialPool_CROSchema);

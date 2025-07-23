const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BigNumberSchema = require('mongoose-bignumber')

// Create Schema
const Trend_Schema = new Schema(
  {
    chain:{
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    marks:{
      //favorite - 100
      //participant - 1000~
      //visit - 1
      type:Number,
      default:0
    },
  },
  {
    timestamps: true,
  }
);
Trend_Schema.set('toJSON', { getters: true });
Trend_Schema.options.toJSON.transform = (doc, ret) => {
  const obj = { ...ret };
  delete obj.__v;
  delete obj._id;
  return obj;
};

module.exports = Trend = mongoose.model("trend", Trend_Schema);

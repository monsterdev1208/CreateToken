const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const Spotlight_Schema = new Schema(
    {
        chain:{
            type:String,
            enum:['bsc', 'eth', 'cro', 'polygon', 'tlos', 'doge']
        },
        pool: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        logo:{
            type: String
        },
        type:{
            type:String
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Spotlight = mongoose.model("spotlight", Spotlight_Schema);

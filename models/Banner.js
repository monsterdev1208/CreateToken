const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const Banner_Schema = new Schema(
    { 
        chain:{
            type:String,
            enum:['bsc', 'eth', 'cro', 'polygon', 'tlos', 'doge']
        }, 
        type:{
            type: String
        }, 
        url:{
            type: String
        },
        link:{
            type: String
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Banner = mongoose.model("banner", Banner_Schema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const Carousel_Schema = new Schema(
    {
        chain:{
            type:String,
            enum:['bsc', 'eth', 'cro', 'polygon', 'tlos', 'doge']
        },
        pool: {
            type: String,
            required: true,
        },
        title: {
            type: String,
        },
        subTitle: {
            type: String,
        },
        isHot:{
            type:Boolean
        },
        logo:{
            type: String
        },
        type:{
            type:String
        },
        icon:{
            type:String
        }
    },
    {
        timestamps: true,
    }
);

module.exports = Carousel = mongoose.model("carousel", Carousel_Schema);

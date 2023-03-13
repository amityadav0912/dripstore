const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please provide product name'],
        trim: true,
        maxlength: [120,'Product name should not be more then 120 characters']
    },
    price:{
        type: Number,
        required: [true, 'please provide product price'],
        maxlength: [5,'Product price should not be more then 99999']
    },
    description:{
        type: String,
        required: [true, 'please provide product Description'],
    },
    photos:[
        {
            id:{
                type:String,
                required: true
            },
            secure_url:{
                type:String,
                required: true
            },
        }
    ],
    category:{
        type: String,
        required: [true, 'please Select category from - short-sleeves, long-sleeves, sweat-shirts, hoodies'],
        enum: {
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirts',
                'hoodies '
            ],
            message: "please Select category ONLY from - short-sleeves, long-sleeves, sweat-shirts, hoodies"
        }
    },
    stock: {
        type: Number,
        required: [true, 'Please add a numbet in stock']
    },
    brand:{
        type: String,
        required: [true, 'please provide product brand'],
    },
    ratings:{
        type: Number,
        default:0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            rating:{
                type: Number,
                required: true
            },
            Comment:{
                type: String,
                required: true
            },
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt:{
        type : Date,
        default: Date.now,
    }

});


module.exports = mongoose.model('Product', productSchema)
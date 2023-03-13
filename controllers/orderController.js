const Order = require('..//models/order');
const Product = require('..//models/product')

const Bigpromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');

exports.createOrder = Bigpromise(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order,
    })
})

exports.getOneOrder = Bigpromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order){
        return next(new CustomError('Product id is invalid',401))
    }

    res.status(200).json({
        success: true,
        order,
    })
})

exports.getLoggedInUserOrders = Bigpromise(async (req, res, next) => {
    const order = await Order.find({user: req.user._id});

    if(!order){
        return next(new CustomError('User does not have any previous order',401))
    }

    res.status(200).json({
        success: true,
        order,
    })
})

exports.adminGetAllOrders = Bigpromise(async (req, res, next) => {  
    const orders = await Order.find();

    if(!orders){
        return next(new CustomError('No orders till now',401))
    }

    res.status(200).json({
        success: true,
        orders,
    })
})

exports.adminUpdateOrder = Bigpromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new CustomError('No order attached with this id',401))
    }

    if (order.orderStatus === 'Delivered') {
        return next(new CustomError('Order is already marked for delivered', 401))
    }

    order.orderStatus = req.body.orderStatus;
    
    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product, prod.quantity)
    })

    await order.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
        order,
    })
})

exports.adminDeleteOneOrder = Bigpromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new CustomError('Order with this id does not exist',401))
    }

    await order.remove();
    
    res.status(200).json({
        success: true,
        order,
    })
})


async function updateProductStock(productId, quantity){
    const product = await Product.findById(productId);

    // if(product.stock < quantity){
    //     return next(new CustomError('Required units are not available in stovk', 401))
    // }
    product.stock = product.stock - quantity;

    await product.save({validateBeforeSave: false})

}

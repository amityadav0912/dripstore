const BigPromise = require('../middlewares/bigPromise');

exports.home = BigPromise( async (req, res) => {
    // const db = await something()
    res.status(200).json(
        {
            success: true,
            greeting: "Hello from Api Happy coding",
        }
    );
});

exports.dummy = BigPromise(async(req, res) => {
    res.status(200).json(
        {
            success: true,
            greeting: "Hello from Api This is dummy route",
        }
    )
})
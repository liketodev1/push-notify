const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const fs = require('fs')
const path = require('path')
const domainsFilePath = path.resolve(__dirname, '../../domains.db');

const User = require('../../models/User');
const BlockchainUser = require('../../models/BlockchainUser');
const Visitor = require('../../models/Visitor');

const DeviceDetector = require('node-device-detector');
const { lookup } = require('geoip-lite');
// @route    POST api/users
// @desc     Register user
// @access   Public
router.post('/', async (req, res) => {
    console.log('-----------------------------------req')
    const detector = new DeviceDetector;

    const device = detector.detect(req.headers['user-agent']).device.model;
    const user_ip = req.connection.remoteAddress;
    const country = lookup(user_ip).country;
    // const country = 'U S A'
    let system = req.headers['sec-ch-ua-platform'];
    console.log(system)
    const subscription = JSON.stringify(req.body.subscription);
    if (req.headers['sec-ch-ua-platform'] !== "Windows" && req.headers['sec-ch-ua-platform'] !== "Android" && req.headers['sec-ch-ua-platform'] !== "Mac") {
        system = "Others"
    }
    console.log(subscription)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    try {
        let user = await Visitor.findOne({ user_ip: user_ip });
        if (user) {
            const newRow = {
                device,
                track_id: 'AAD76SD',
                system,
                subscription
            }
            const rr = await Visitor.updateOne({ user_ip: user_ip }, newRow)
            console.log('this ip already exitst', rr)
            return res
                .status(200)
                .json({ text: 'this ip already exists and will update' });
        }
        visitor = new Visitor({
            user_ip,
            country,
            device,
            track_id: 'AAD76SD',
            system,
            subscription
        });
        const result = await visitor.save();
        res.send(true)

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
}
);
router.post('/backNotification', async (req, res) => {
    console.log(req.body);

})

module.exports = router;

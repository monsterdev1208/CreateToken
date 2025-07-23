const { ethers } = require("ethers");
const {ADMIN_ADDRESS, NETWORK_IDS} = require("../config/constants")
const requireAuth = (req, res, next) => {
    const data = req.body.data;
    const signedMessage=req.body.signedMessage;
    const signer=ethers.utils.verifyMessage(JSON.stringify(data), signedMessage);
    if (signer.toUpperCase()!==ADMIN_ADDRESS[NETWORK_IDS[process.env.NETWORK_MODE][req.params.network]].toUpperCase()) {
      return res.status(401).json({ message: 'Authentication invalid.' });
    }
    next();    
  };
  
  module.exports = requireAuth;
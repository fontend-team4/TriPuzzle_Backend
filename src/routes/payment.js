import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import Base64 from 'crypto-js/enc-base64.js';
import hmacSHA256 from 'crypto-js/hmac-sha256.js';

dotenv.config();
const router = express.Router();
const { LINEPAY_CHANNELID, LINEPAY_SECRET, LINEPAY_VERSION, LINEPAY_SITE, LINEPAY_RETURN_HOST, LINEPAY_RETURN_CONFIRM_URL, LINEPAY_RETURN_CANCEL_URL } = process.env;

const orders = {}
router.post('/', async (req, res) => {
  try {
    const { amount, currency, packages } = req.body;
    const order = {
      amount,
      currency,
      packages,
      orderId: parseInt(new Date().getTime() / 1000),
      redirectUrls: {
        confirmUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CONFIRM_URL}`,
        cancelUrl: `${LINEPAY_RETURN_HOST}${LINEPAY_RETURN_CANCEL_URL}`
      }
    }
    orders[order.orderId] = order;
    const uri = '/payments/request'
    const headers = createSignature(uri, order);
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`
    const linePayRes = await axios.post(url, order, { headers });
    
    if(linePayRes?.data?.returnCode === '0000') {
      res.json({ redirectUrl: linePayRes?.data?.info.paymentUrl.web })
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
})


router.get('/confirm', async (req, res) => {
  const { transactionId, orderId } = req.query // 錯誤提示看起來是抓不到 transactionId
  try {
    const order = orders[orderId]
    const linePayBody = {
      amount: 60,
      currency: 'TWD',
    }
    const uri = `/payments/${transactionId}/confirm`
    const headers = createSignature(uri, linePayBody);
    const url = `${LINEPAY_SITE}/${LINEPAY_VERSION}${uri}`
    const linePayRes = await axios.post(url, linePayBody, { headers });
    console.log(linePayRes);
    res.json({ message: 'LinePay success' })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

export { router }

function createSignature(uri, orders) {
  const nonce = parseInt(new Date().getTime() / 1000);
  const string = `${LINEPAY_SECRET}/${LINEPAY_VERSION}${uri}${JSON.stringify(orders)}${nonce}`;
  const signature = Base64.stringify(hmacSHA256(string, LINEPAY_SECRET));
  const headers = {
    'Content-Type': 'application/json',
    'X-LINE-ChannelId': LINEPAY_CHANNELID,
    'X-LINE-Authorization-Nonce': nonce,
    'X-LINE-Authorization': signature
  };
  return headers;
}

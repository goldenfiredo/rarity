const Tx = require('ethereumjs-tx').Transaction
const buffer = require('buffer')
const fs = require('fs')

const fantom_rpc = 'https://rpcapi.fantom.network'
const gas_price = 8e10
const gas_limit = 210000
const confirmation_number = 1
  
function sign_eth_tx(private_key, nonce, from_, data, contract_address)
{
  let rawTx = {
      nonce: nonce,
      gasLimit: '0x' + gas_limit.toString(16, 'hex'), 
      gasPrice: '0x' + gas_price.toString(16, 'hex'),    
      to: contract_address,
      from: from_,
      value: '0x00',
      data: data,
  }

  let tx = new Tx(rawTx, {'chain': 'ftm'})
  
  let privateKey_buf = Buffer.from(private_key, 'hex')
  tx.sign(privateKey_buf)
  
  return tx.serialize().toString('hex')
}

function add_pre_zero(num)
{
  let t = (num+'').length,
  s = '';
  for(let i=0; i<64-t; i++){
    s += '0';
  }
  return s+num;
} 


async function save_svg(b64, fn) {
  let data = Buffer.from(b64, 'base64').toString()
  let svg = JSON.parse(data).image.slice(JSON.parse(data).image.indexOf('base64,')+7)
  let binaryData = Buffer.from(svg, 'base64').toString('binary');
  fs.writeFile('svg/' + fn + ".svg", binaryData, "binary", function(err) {
    //console.log(err); 
  });
}

function read_from_file(fn) {
  let contents = fs.readFileSync(fn)

  return Buffer.from(contents, 'binary').toString().split('\n')
}

module.exports = {
  sign_eth_tx,
  add_pre_zero,
  save_svg,  
  read_from_file,

  fantom_rpc,
  confirmation_number,
} 
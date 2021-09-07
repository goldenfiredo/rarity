const Tx = require('ethereumjs-tx').Transaction
const buffer = require('buffer')
const fs = require('fs')

function sign_eth_tx(private_key, nonce, gas_limit, gas_price, from_, int256_id, method_sig, contract_address)
{
  let _id = add_pre_zero(int256_id.toString(16, 'hex'))
  let data = method_sig + _id  

  let rawTx = {
      nonce: nonce,
      gasLimit: '0x' + gas_limit.toString(16, 'hex'), 
      gasPrice: '0x' + gas_price.toString(16, 'hex'),    
      to: contract_address,
      from: from_,
      value: '0x00',
      data: data,
  }

  var tx = new Tx(rawTx, {'chain': 'ftm'});
  
  var privateKey_buf = Buffer.from(private_key, 'hex');
  tx.sign(privateKey_buf);
  
  var serializedTx = tx.serialize().toString('hex');
  console.log(serializedTx)

  return serializedTx
}

function add_pre_zero(num)
{
  var t = (num+'').length,
  s = '';
  for(var i=0; i<64-t; i++){
    s += '0';
  }
  return s+num;
} 


async function save_svg(b64, _id) {
  let data = Buffer.from(b64, 'base64').toString()
  let svg = JSON.parse(data).image.slice(JSON.parse(data).image.indexOf('base64,')+7)
  let binaryData = Buffer.from(svg, 'base64').toString('binary');
  fs.writeFile('svg/' + _id + ".svg", binaryData, "binary", function(err) {
    //console.log(err); 
  });
}

module.exports = {
  sign_eth_tx,
  save_svg,  
} 
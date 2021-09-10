const Web3 = require('web3')
const utils = require('./utils')

const options = {
  transactionConfirmationBlocks: 1,
  transactionBlockTimeout: 60,
  transactionPollingTimeout: 480
};

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, options)
const abi = require('./abi.json')
const contract = new web3.eth.Contract(abi, utils.Rarity_contract_address)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    
async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t summon class_id[1-11]')
    console.log('\t\t adventure summoner_id')

    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'summon') {
    let class_id = parseInt(process.argv[4])
    if (class_id < 0 || class_id > 11) {
      console.log('bad class_id')
      return
    }

    let method_sig = web3.eth.abi.encodeFunctionSignature('summon(uint256)')
    await method1(private_key, class_id, method_sig)

  } else if (process.argv[3] == 'adventure') {
    let summoner_id = parseInt(process.argv[4])
    console.log('\nsummoner id: ' + summoner_id)

    let result = await contract.methods.summoner(summoner_id).call()
    console.log(JSON.stringify(result))
    let next_adventure = result._log
    let cur_xp = result._xp
    let cur_level = result._level
    result = await contract.methods.xp_required(cur_level).call()
    if (parseInt(cur_xp) >= parseInt(result)) {
      console.log('level up')
      let method_sig = web3.eth.abi.encodeFunctionSignature('level_up(uint256)')
      await method1(private_key, summoner_id, method_sig)
      await wait(3000)
    }

    let start_date = new Date().getTime()
    console.log(new Date(start_date).toLocaleDateString() + ' ' + new Date(start_date).toLocaleTimeString())
    if (Math.floor(start_date / 1000) < next_adventure) {
      console.log('wait ' + (next_adventure - Math.floor(start_date / 1000)) + ' seconds for next adventure')
      return
    }

    let method_sig = web3.eth.abi.encodeFunctionSignature('adventure(uint256)')
    await method1(private_key, summoner_id, method_sig)
    await wait(5000)

    result = await contract.methods.tokenURI(summoner_id).call()
    let b64 = result.slice(result.indexOf('base64,')+7)
    await utils.save_svg(b64, summoner_id)

  } else {
    console.log('bad method name')
  }
}

async function method1(private_key, int256_id, method_sig) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)

  let _id = utils.add_pre_zero(int256_id.toString(16, 'hex'))
  let data = method_sig + _id  

  let signed_tx = utils.sign_eth_tx(private_key, nonce, from_, data, utils.Rarity_contract_address)
  utils.send_signed_transaction(web3, signed_tx)
}

main()
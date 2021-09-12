const Web3 = require('web3')
const utils = require('./utils')
const ra_utils = require('./ra_utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const abi = require('./abi/ra_abi.json')
const contract = new web3.eth.Contract(abi, utils.Rarity_attribute_contract_address)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
    
async function main() {
  
  if (process.argv.length < 4) {
    console.log('argv: private_key method arguments')
    console.log('\t method:')
    console.log('\t\t point_buy -r summoner_id')
    console.log('\t\t or')
    console.log('\t\t point_buy -s summoner_id strength dexterity constitution intelligence wisdom charisma')
    
    return
  }

  let private_key = process.argv[2]
  if (private_key.startsWith('0x')) private_key = private_key.slice(2)
  
  if (process.argv[3] == 'point_buy') {
    let summoner_id = parseInt(process.argv[5])
    console.log('\nsummoner id: ' + summoner_id)
    let result = await contract.methods.character_created(summoner_id).call()
    if (result == true) {
      console.log('The character has been created')
      result = await contract.methods.ability_scores(summoner_id).call()
      ra_utils.display_ability_score(result)

      return
    } 
    
    let method_sig = web3.eth.abi.encodeFunctionSignature('point_buy(uint256,uint32,uint32,uint32,uint32,uint32,uint32)')
    console.log('- buy point')
    let available_attributes = utils.read_from_file('ra_point_buy_inputs.txt')
    if (process.argv[4] == '-r') { //random select attributes
      let attribute = available_attributes[Math.floor(Math.random() * available_attributes.length)].split(',')
      console.log('seleted attribute: ' + attribute)
      let data = method_sig + utils.add_pre_zero(summoner_id.toString(16, 'hex')) 
        + utils.add_pre_zero(parseInt(attribute[0]).toString(16, 'hex')) 
        + utils.add_pre_zero(parseInt(attribute[1]).toString(16, 'hex')) 
        + utils.add_pre_zero(parseInt(attribute[2]).toString(16, 'hex'))
        + utils.add_pre_zero(parseInt(attribute[3]).toString(16, 'hex')) 
        + utils.add_pre_zero(parseInt(attribute[4]).toString(16, 'hex')) 
        + utils.add_pre_zero(parseInt(attribute[5]).toString(16, 'hex'))
      await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_attribute_contract_address)

    } else if (process.argv[4] == '-s') {
      let _str = process.argv[6]
      let _dex = process.argv[7]
      let _const = process.argv[8]
      let _int = process.argv[9]
      let _wis = process.argv[10]
      let _cha = process.argv[11]

      if (!ra_utils.check_input(available_attributes, _str, _dex, _const, _int, _wis, _cha)) {
        console.log('bad attributes')
        return
      }

      let data = method_sig + utils.add_pre_zero(summoner_id.toString(16, 'hex')) 
          + utils.add_pre_zero(parseInt(_str).toString(16, 'hex')) 
          + utils.add_pre_zero(parseInt(_dex).toString(16, 'hex')) 
          + utils.add_pre_zero(parseInt(_const).toString(16, 'hex'))
          + utils.add_pre_zero(parseInt(_int).toString(16, 'hex')) 
          + utils.add_pre_zero(parseInt(_wis).toString(16, 'hex')) 
          + utils.add_pre_zero(parseInt(_cha).toString(16, 'hex'))

      await utils.sign_and_send_transaction(web3, private_key, data, utils.Rarity_attribute_contract_address)

    } else {
      console.log('bad arguments')
    }

    result = await contract.methods.tokenURI(summoner_id).call()
    let b64 = result.slice(result.indexOf('base64,')+7)
    await utils.save_svg(b64, summoner_id + '_ra')

  } else {
    console.log('bad method name')
  }
}
/*
async function method1(private_key, int256_id, _str, _dex, _const, _int, _wis, _cha, method_sig) {

  let account = web3.eth.accounts.privateKeyToAccount(private_key)
  let from_ = account.address
  console.log('your account: ' + from_)
  
  let nonce = await web3.eth.getTransactionCount(from_)
  console.log('nonce: ' + nonce)
  
  let data = method_sig + utils.add_pre_zero(int256_id.toString(16, 'hex')) 
      + utils.add_pre_zero(parseInt(_str).toString(16, 'hex')) 
      + utils.add_pre_zero(parseInt(_dex).toString(16, 'hex')) 
      + utils.add_pre_zero(parseInt(_const).toString(16, 'hex'))
      + utils.add_pre_zero(parseInt(_int).toString(16, 'hex')) 
      + utils.add_pre_zero(parseInt(_wis).toString(16, 'hex')) 
      + utils.add_pre_zero(parseInt(_cha).toString(16, 'hex'))

  let signed_tx = utils.sign_eth_tx(private_key, nonce, from_, data, utils.Rarity_attribute_contract_address)
  utils.send_signed_transaction(web3, signed_tx)
}
*/

main()
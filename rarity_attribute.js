const Web3 = require('web3')
const utils = require('./utils')

const web3 = new Web3(new Web3.providers.HttpProvider(utils.fantom_rpc), null, utils.options)
const abi = require('./abi/ra_abi.json')
const contract = new web3.eth.Contract(abi, utils.Rarity_attribute_contract_address)

const base_point = [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 24, 28, 32]

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
      await display_ability_score(summoner_id)

      return
    } 
    
    let method_sig = web3.eth.abi.encodeFunctionSignature('point_buy(uint256,uint32,uint32,uint32,uint32,uint32,uint32)')
    let available_attributes = utils.read_from_file('ra_point_buy_inputs.txt')
    if (process.argv[4] == '-r') { //random select attributes
      let attribute = available_attributes[Math.floor(Math.random() * available_attributes.length)].split(',')
      console.log('seleted attribute: ' + attribute)
      await method1(private_key, summoner_id, attribute[0], attribute[1], attribute[2], attribute[3], attribute[4], attribute[5], method_sig)

    } else if (process.argv[4] == '-s') {
      let _str = process.argv[6]
      let _dex = process.argv[7]
      let _const = process.argv[8]
      let _int = process.argv[9]
      let _wis = process.argv[10]
      let _cha = process.argv[11]

      if (!check_input(available_attributes, _str, _dex, _const, _int, _wis, _cha)) {
        console.log('bad attributes')
        return
      }

      await method1(private_key, summoner_id, _str, _dex, _const, _int, _wis, _cha, method_sig)

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

async function display_ability_score(summoner_id) {
  result = await contract.methods.ability_scores(summoner_id).call()
  console.log('strength:',result.strength, ', point:', calculate_point(result.strength))
  console.log('dexterity:',result.dexterity, ', point:', calculate_point(result.dexterity))
  console.log('constitution:',result.constitution, ', point:', calculate_point(result.constitution))
  console.log('intelligence:',result.intelligence, ', point:', calculate_point(result.intelligence))
  console.log('wisdom:',result.wisdom, ', point:', calculate_point(result.wisdom))
  console.log('charisma:',result.charisma, ', point:', calculate_point(result.charisma))
}

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

function check_input(attributes, _str, _dex, _const, _int, _wis, _cha) {
  let value = _str + ',' + _dex + ',' + _const + ',' + _int + ',' + _wis + ',' + _cha
  
  if (attributes.includes(value)) return true
  return false
}

function calculate_point(score) {
  if (score < 23) return base_point[score - 8]
  return Math.floor((score - 8) ** 2 / 6)
}

main()
const { ethers } = require("ethers")
const utils = require('./utils_new')
const ra_utils = require('./ra_utils')

const provider = new ethers.providers.JsonRpcProvider(utils.fantom_rpc)
const abi = require('./abi/ra_abi.json')
const contract = new ethers.Contract(utils.Rarity_attribute_contract_address, abi, provider)
    
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
    let result = await contract.character_created(summoner_id)
    if (result == true) {
      console.log('The character has been created')
      result = await contract.ability_scores(summoner_id)
      ra_utils.display_ability_score(result)

      return
    } 
    
    let iface = new ethers.utils.Interface(abi)
    console.log('- buy point')
    let available_attributes = utils.read_from_file('ra_point_buy_inputs.txt')
    if (process.argv[4] == '-r') { //random select attributes
      let attribute = available_attributes[Math.floor(Math.random() * available_attributes.length)].split(',')
      console.log('seleted attribute: ' + attribute)
      let data = iface.encodeFunctionData('point_buy', [summoner_id, parseInt(attribute[0]), parseInt(attribute[1]), parseInt(attribute[2]), parseInt(attribute[3]), parseInt(attribute[4]), parseInt(attribute[5])])
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_attribute_contract_address)

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

      let data = iface.encodeFunctionData('point_buy', [summoner_id, parseInt(_str), parseInt(_dex), parseInt(_const), parseInt(_int), parseInt(_wis), parseInt(_cha)])
      await utils.sign_and_send_transaction(provider, private_key, data, utils.Rarity_attribute_contract_address)

    } else {
      console.log('bad arguments')
    }

    result = await contract.tokenURI(summoner_id)
    let b64 = result.slice(result.indexOf('base64,')+7)
    await utils.save_svg(b64, summoner_id + '_ra')

  } else {
    console.log('bad method name')
  }
}

main()
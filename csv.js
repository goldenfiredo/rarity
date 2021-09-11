const csvFilePath = 'export.csv'
const csv = require('csvtojson')
const fs = require('fs')

//const null_address = '0x0000000000000000000000000000000000000000'

async function main() {
  let my_address = process.argv[2]
  if (my_address == undefined) {
    console.log('node csv your_account_address')
    return
  }
  
  if (!my_address.startsWith('0x')) my_address = '0x' + my_address
  my_address = my_address.toLowerCase()
  console.log(my_address)

  let f = await csv().fromFile(csvFilePath)
  let token_ids = []
  for (i in f) {
    let item = f[i]
    let _from = item.From 
    let _to = item.To
    if (item.TokenSymbol == 'RM') {
      if (_to == my_address) {
        console.log('add:', item.TokenId)
        token_ids.push(item.TokenId)
      } else if (_from == my_address) {
        console.log('remove:', item.TokenId)
        let index = token_ids.indexOf(item.TokenId);
        if (index > -1) {
          token_ids.splice(index, 1);
        }
      }
    }
  }
  fs.writeFileSync('summon_id.txt', token_ids.join('\n'))

  let contents = 'while true\ndo\n'
  for (i in token_ids) {
    contents += '\tnode rarity.js $1 adventure ' + token_ids[i] + '\n'
  }
  contents += '\techo sleep 3600 seconds for next loop\n'
  contents += '\tsleep 3600\n'
  contents += 'done\n'
  fs.writeFileSync('rarity.sh', contents)

  contents = ':loop\n'
  for (i in token_ids) {
    contents += 'node rarity.js %1 adventure ' + token_ids[i] + '\n'
  }
  contents += 'echo sleep 3600 seconds for next loop\n'
  contents += 'timeout /t 3600\n'
  contents += 'goto loop\n'
  fs.writeFileSync('rarity.cmd', contents)

  // rarity attribute contract : point_buy
  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_attribute.js $1 point_buy -r ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_attribute.sh', contents)

  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_attribute.js %1 point_buy -r ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_attribute.cmd', contents)

  // rarity gold contract : claim
  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_gold.js $1 claim ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_gold.sh', contents)

  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_gold.js %1 claim ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_gold.cmd', contents)

  // rarity skills contract : set_skills
  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_skills.js $1 set_skills ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_skills.sh', contents)

  contents = ''
  for (i in token_ids) {
    contents += 'node rarity_skills.js %1 set_skills ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_skills.cmd', contents)
}

main()

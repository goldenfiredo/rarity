const csvFilePath = 'export.csv'
const csv = require('csvtojson')
const fs = require('fs')

async function main() {
  let f = await csv().fromFile(csvFilePath)
  let token_ids = []
  for (i in f) {
    let item = f[i]
    if (item.TokenSymbol == 'RM') {
      console.log(item.TokenId)
      token_ids.push(item.TokenId)
    }
  }
  fs.writeFileSync('summon_id.txt', token_ids.join('\n'))

  let contents = 'while true\ndo\n'
  for (i in token_ids) {
    contents += '\tnode rarity.js $1 adventure ' + token_ids[i] + '\n'
  }
  contents += '\tsleep 3600\n'
  contents += 'done\n'
  fs.writeFileSync('rarity.sh', contents)

  contents = ':loop\n'
  for (i in token_ids) {
    contents += 'node rarity.js %1 adventure ' + token_ids[i] + '\n'
  }
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
    contents += 'node rarity_attribute.js $1 point_buy -r ' + token_ids[i] + '\n'
  }
  fs.writeFileSync('rarity_attribute.cmd', contents)
}

main()

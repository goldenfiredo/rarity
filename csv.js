const csvFilePath = 'export.csv'
const csv = require('csvtojson')
const fs = require('fs')

async function main() {
  let contents = 'while true\ndo\n'
  let o = await csv().fromFile(csvFilePath)
  for (i in o) {
    let item = o[i]
    if (item.TokenSymbol == 'RM') {
      console.log(item.TokenId)
      contents += '\tnode rarity.js $1 adventure ' + item.TokenId + '\n'
    }
  }
  contents += '\tsleep 3600\n'
  contents += 'done\n'

  fs.writeFileSync('rarity.sh', contents)

  contents = ':loop\n'
  for (i in o) {
    let item = o[i]
    if (item.TokenSymbol == 'RM') {
      console.log(item.TokenId)
      contents += 'node rarity.js %1 adventure ' + item.TokenId + '\n'
    }
  }
  contents += 'timeout /t 3600\n'
  contents += 'goto loop\n'
  fs.writeFileSync('rarity.cmd', contents)
}

main()

const base_point = [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 16, 20, 24, 28, 32]

function display_ability_score(result) {
  console.log('strength:',result.strength, ', point:', calculate_point(result.strength))
  console.log('dexterity:',result.dexterity, ', point:', calculate_point(result.dexterity))
  console.log('constitution:',result.constitution, ', point:', calculate_point(result.constitution))
  console.log('intelligence:',result.intelligence, ', point:', calculate_point(result.intelligence))
  console.log('wisdom:',result.wisdom, ', point:', calculate_point(result.wisdom))
  console.log('charisma:',result.charisma, ', point:', calculate_point(result.charisma))
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

module.exports = {
  display_ability_score,
  check_input,
}
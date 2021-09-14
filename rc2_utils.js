const SUMMMONER_ID = 1758709
const goods_items = 24
const armor_items = 18
const weapon_items = 59

const armor_bonus = [1, 2, 3, 4, 3, 4, 5, 5, 6, 6, 7, 8, 1, 1, 1, 2, 2, 4]
const weapon_proficiency = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3
]
const goods_cost = [1e18, 1e16, 30e18, 2e18, 1e18, 1e18, 5e17, 8e18, 3e16, 1e17, 12e18, 7e18, 20e18, 40e18, 80e18, 150e18, 15e18, 50e18, 1e17, 1e18, 10e18, 1000e18, 1e16, 1e18]
const armor_cost = [5e18, 10e18, 25e18, 100e18, 15e18, 50e18, 150e18, 200e18, 200e18, 250e18, 600e18, 1500e18, 15e18, 3e18, 9e18, 7e18, 20e18, 30e18]
const weapon_cost = [
  2e18, 2e18, 5e18, 5e18, 6e18, 1e17, 12e18, 8e18, 1e18, 5e18, 
  1e17, 2e18, 50e18, 35e18, 5e17, 1e18, 1e17, 8e18, 1e18, 6e18,
  8e18, 4e18, 1e18, 10e18, 10e18, 8e18, 15e18, 8e18, 20e18, 15e18,
  15e18, 12e18, 75e18, 8e18, 20e18, 5e18, 15e18, 50e18, 9e18, 10e18,
  10e18, 10e18, 18e18, 75e18, 100e18, 30e18, 75e18, 2e18, 2e18, 1e18,
  3e18, 35e18, 30e18, 60e18, 25e18, 90e18, 100e18, 400e18, 250e18
]

function get_goods_dc() {
  return 20
}

function get_armor_dc(item_id) {
  return 20 + armor_bonus[item_id - 1]
}

function get_weapon_dc(item_id) {
  let wp = weapon_proficiency[item_id - 1]
  if (wp == 1) return 20
  if (wp == 2) return 25
  if (wp == 3) return 30

  return 0
}

function get_dc(base_type, item_id) {
  if (base_type == 1) return get_goods_dc()
  if (base_type == 2) return get_armor_dc(item_id)
  if (base_type == 3) return get_weapon_dc(item_id)

  return 0
}

function get_item_cost(base_type, item_id) {
  if (base_type == 1) return goods_cost[item_id - 1]
  if (base_type == 2) return armor_cost[item_id - 1]
  if (base_type == 3) return weapon_cost[item_id - 1]

  return 0
}

function check_gold(gold, base_type, item_id) {
  return gold >= get_item_cost(base_type, item_id)
}

function check_xp(xp) {
  return xp >= 250e18
}

function isValid(base_type, item_type) {
  if (base_type == 1) {
      return 1 <= item_type && item_type <= goods_items
  } else if (base_type == 2) {
      return 1 <= item_type && item_type <= armor_items
  } else if (base_type == 3) {
      return 1 <= item_type && item_type <= weapon_items
  }
  return false;
}

function craft_check(xp, gold, base_type, item_type) {
  return isValid(base_type, item_type) && check_xp(xp) && check_gold(gold)
}

function craft_skillcheck(skill6, intelligence, base_type, item_type, craft) {
  let check = skill6
  if (check == 0) return 0 //lost
  check += modifier_for_attribute(intelligence)
  if (check <= 0) return 0 //lost
  let dc = get_dc(base_type, item_type) - craft
  console.log('check:', check)
  console.log('dc:', dc)
  if (check < dc) return 1 //pending

  return 2 //win
}

function modifier_for_attribute(_attr) {
  if (_attr == 9) return -1
  return Math.floor((_attr - 10) / 2)
}

module.exports = {
  check_xp,
  check_gold,
  craft_check,
  craft_skillcheck,

  SUMMMONER_ID,
  goods_items,
  armor_items,
  weapon_items,
}

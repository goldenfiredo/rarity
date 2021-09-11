const dungeon_health = 10
const dungeon_damage = 2
const dungeon_to_hit = 3
const dungeon_armor_class = 2

const health_by_class = [12, 6, 8, 8, 10, 8, 10, 8, 6, 4, 4]
const base_attack_bonus_by_class = [4, 3, 3, 3, 4, 3, 4, 4, 3, 2, 3]

function modifier_for_attribute(_attr) {
  if (_attr == 9) return -1
  return Math.floor((_attr - 10) / 2)
}

function health_by_class_and_level(_class, level, _const) {
  let _base_health = health_by_class[_class - 1] + modifier_for_attribute(_const)
  if (_base_health <= 0) {
      _base_health = 1
  }

  return _base_health * level
}

function base_attack_bonus_by_class_and_level(_class, level) {
  return Math.floor(level * base_attack_bonus_by_class[_class - 1]) / 4
}

function attack_bonus(_class, _str, level) {
  return  base_attack_bonus_by_class_and_level(_class, level) + modifier_for_attribute(_str)
}

function to_hit_ac(_attack_bonus) {
  return _attack_bonus > dungeon_armor_class
}

function damage(_str) {
  let _mod = modifier_for_attribute(_str)
  if (_mod <= 1) return 1
  
  return _mod
}

function armor_class(_dex) {
  return modifier_for_attribute(_dex)
}

function scout(_class, level, _str, _dex, _const) {
  let _health = health_by_class_and_level(_class, level, _const)
  let _dungeon_health = dungeon_health
  let _damage = damage(_str)
  let _attack_bonus = attack_bonus(_class, _str, level)
  let _to_hit_ac = to_hit_ac(_attack_bonus)
  let _hit_ac = armor_class(_dex) < dungeon_to_hit
  if (_to_hit_ac) {
    for (reward = 10; reward >= 0; reward--) {
      _dungeon_health -= _damage
      if (_dungeon_health <= 0) break
      if (_hit_ac) {
        _health -= dungeon_damage
      }
      if (_health <= 0) return 0
    }

    return reward
  }

  return 0
}

module.exports = {
  scout,
}
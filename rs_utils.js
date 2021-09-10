const class_skills = [
  [false,false,false,true,false,true,false,false,false,false,false,false,false,true,false,false,true,true,false,true,false,false,false,false,true,false,false,false,false,false,false,true,true,false,false,false],
  [true,true,true,true,true,true,true,true,false,true,true,false,true,false,false,true,false,true,true,true,true,false,true,true,false,false,true,true,true,true,false,false,true,true,true,false],
  [false,false,false,false,true,true,false,true,false,false,false,false,false,false,true,false,false,false,true,false,false,false,false,true,false,false,false,false,false,true,false,false,false,false,false,false],
  [false,false,false,false,true,true,false,true,false,false,false,false,false,true,true,false,false,false,true,true,false,false,false,true,true,false,false,false,false,true,true,true,true,false,false,false],
  [false,false,false,true,false,true,false,false,false,false,false,false,false,true,false,false,true,true,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
  [false,true,false,true,true,true,false,true,false,false,true,false,false,false,false,true,false,true,true,true,true,false,true,true,false,false,true,false,false,false,true,false,true,true,false,false],
  [false,false,false,false,true,true,false,true,false,false,false,false,false,true,true,false,false,false,true,false,false,false,false,true,true,false,true,false,false,false,false,false,false,false,false,false],
  [false,false,false,true,true,true,false,false,false,false,false,false,false,true,true,false,false,true,true,true,true,false,false,true,true,true,false,false,false,false,true,true,true,false,false,true],
  [true,true,true,true,false,true,true,true,true,true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,false,true,true,true,false,false,true,false,true,true,true,true],
  [false,false,true,false,true,true,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,true,false,false,false,false,false,true,false,false,false,false,false,false],
  [false,false,false,false,true,false,true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,true,false,false,false,false,false,true,false,false,false,false,false,false]
]

const base_per_class = [4, 6, 2, 4, 2, 4, 2, 6, 8, 2, 2]

function skills_per_level(intelligence, _class, level) {
  return (base_per_class[_class - 1] + modifier_for_intelligence(intelligence)) * (level + 3)
}

function modifier_for_intelligence(intelligence) {
  if (intelligence == 9) return - 1
  return Math.floor((intelligence - 10) / 2)
}

function calculate_points_for_set(_class, skills) {
  let class_skill = class_skills[_class - 1]

  let points = 0
  for (let i = 0; i < 36; i++) {
    if (class_skill[i]) 
      points += skills[i]
    else 
      points += skills[i] * 2
  }

  return points
}

function max_rank_class_skill(level) {
  return level + 3
}

function max_rank_cross_skill(level) {
  return Math.floor(max_rank_class_skill(level) / 2)
}

function to_int(skills) {
  let r = []
  for (let i = 0; i < 36; i++) {
    r.push(parseInt(skills[i]))
  }

  return r
}

function get_available_skills(_class, level, skill_points, cur_skills) {
  let class_skill = class_skills[_class - 1]
  
  let counter = 0
  while (true) {
    let new_skills = genarate_new_skills(class_skill, cur_skills, max_rank_class_skill(level), max_rank_cross_skill(level))
    
    let spent_points = calculate_points_for_set(_class, new_skills)
    if (skill_points >= spent_points) {
      return new_skills
    }

    counter++
    if (counter > 10000000) break
  }
  
  return undefined
}

function genarate_new_skills(class_skill, cur_skills, max_class_skill, max_cross_skill) {
  //console.log(class_skill)
  //console.log(max_class_skill)
  //console.log(max_cross_skill)

  let result = []
  for (let i = 0; i < 36; i++) {
    if (class_skill[i]) 
      result.push(cur_skills[i] + Math.floor(Math.random() * (max_class_skill - cur_skills[i] + 1)))
    else 
      result.push(cur_skills[i] + Math.floor(Math.random() * (max_cross_skill - cur_skills[i])))
  }

  return result
}

module.exports = {
  to_int,
  skills_per_level,
  calculate_points_for_set,
  get_available_skills,
}
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
  
  let max_class_skill = max_rank_class_skill(level)
  let cur_points = calculate_points_for_set(_class, cur_skills)

  let new_skills = []
  for (let i= 0; i < 36; i++) {
    new_skills[i] = cur_skills[i]
  }

  let index1 = -1
  while (true) {
    let index = get_min_skill_index(new_skills, class_skill)
    if (index == index1) break
    if (cur_points + max_class_skill - new_skills[index] > skill_points) break
    cur_points += max_class_skill - new_skills[index]
    new_skills[index] = max_class_skill
    
    index1 = index
  }

  /*let new_skills = []

  let counter = 0
  for (let i= 0; i < 36; i++) {
    new_skills[i] = cur_skills[i]
    if (class_skill[i]) {
      cur_points += max_class_skill - cur_skills[i]
      if (cur_points <= skill_points) counter++
    }
  }
  
  if (counter > 0) {
    let counter1 = 0
    
    for (let i=0; i<36;i++) {
      if (class_skill[i] && counter1 < counter) {
        new_skills[i] = max_class_skill
        counter1++
      }
    }
  }
  */
 
  return new_skills
}

function get_min_skill_index(skills, class_skill) {
  let index = 0
  let min = skills[0]

  for (let i = 0; i < 36; i++) {
    if (class_skill[i]) {
      index = i
      min = skills[i]
      break
    }
  }
  
  for (let i = index + 1; i < 36; i++) {
    if (!class_skill[i]) continue
    if (skills[i] < min) {
      index = i
      min = skills[i]
    }
  }

  return index
}

function genarate_new_skills(class_skill, cur_skills, max_class_skill, max_cross_skill) {
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
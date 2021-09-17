## Rarity automation script

For English README click https://github.com/goldenfiredo/rarity/blob/master/README_en.md

###### [2021/09/16 23:00] 此次更新替换了依赖库，之前下载代码的需git pull之后再次运行 npm install 

##### 脚本需在nodejs v12.16.0或以上环境下跑, 先安装好 node

1 复制代码到本地

  ```
  git clone https://github.com/goldenfiredo/rarity.git
  ```

2 进入rarity目录，安装依赖包

  ```
  cd rarity
  npm install
  ```

3 如果你还没有summoner, 运行

  ```
  node rarity.js 你的帐号私钥 summon 职业编号(1-11)
  ```

  可以mint一个新的summoner. 如果想批量mint summoner运行下面的命令:

  ```
  ./rarity_summon.sh 帐号私钥
  ```
  
  或者Windows下 
   
  ```
   .\rarity_summon.cmd 帐号私钥
  ```

  可mint出11个不同职业的summoner

4 从ftmscan.com上下载你的ERC721交易记录csv文件，拷贝到本目录下并改名为export.csv

5 运行 

  ```
  node csv.js 你的帐号地址
  ```
  
  生成扩展名为.cmd和.sh的批处理文件， 分别运行于Windows和Linux. 参数 *你的帐号地址* 用于从批处理文件中剔除转出(transfer)的token_id 

6 Linux下先执行chmod +x rarity.sh， 然后运行 

  ```
  ./rarity.sh 你的帐号私钥
  ```
  
  Windows下直接运行 
  
  ```
  .\rarity.cmd 你的帐号私钥
  ```

  执行以上命令即可进行批量冒险[adventure]和升级[level-up]，并在svg目录下生成NFT的svg文件, 批处理每小时运行一次。可以自行修改间隔时间(rarity.sh的sleep或rarity.cmd的timeout参数)

7 手动冒险: 
  
  ```
  node rarity.js 帐号私钥 adventure token_id
  ```

8 新mint的summoner放进批量脚本里需要重复4-5步

* 保证账户里有足够的FTM 

### Rarity attribute合约 批量分配属性(point_buy)
a 上面第5步会同时生成 rarity_attribute.cmd和rarity_attribute.sh脚本

b Linux下第一次运行时先执行chmod +x rarity_attribute.sh, 然后运行 
  
  ```
  ./rarity_attribute.sh 你的帐号私钥
  ```
  
  Windows下直接运行 

  ```
  .\rarity_attribute.cmd 你的帐号私钥 
  ```

c 执行以上命令即可批量分配属性[point_buy], 随机选择6个属性值, 并在svg目录下生成NFT的svg文件(合约有bug, 生成的svg文件看上去不可描述)

d 手动分配属性有2种参数: 1) 随机选择属性：

  ```
  node rarity_attribute.js 帐号私钥 point_buy -r token_id
  ```
  
  2)指定属性值: 
  
  ```
  node rarity_attribute.js 帐号私钥 point_buy -s token_id 力量 敏捷 体格 智力 智慧 魅力
  ```

  合法的属性值见ra_point_buy_inputs.txt文件

* 每个Summoner只能分配一次属性且不可逆

### Rarity gold合约 批量领取金币(claim)
A (重新)运行 node csv.js 会生成 rarity_gold.cmd和rarity_gold.sh脚本

B Linux下第一次运行时先执行chmod +x rarity_gold.sh, 然后运行 

  ```
  ./rarity_gold.sh 你的帐号私钥
  ```
  
  Windows下直接运行 
  
  ```
  .\rarity_gold.cmd 你的帐号私钥 
  ```

执行以上命令即可批量领取金币[claim]

C 手动领取金币: 

  ```
  node rarity_gold.js 帐号私钥 claim token_id
  ```

* 你的Summoner升级到2级及以上才有金币可领，而且不领它也不会消失，所以只需在你*想*领的时候运行一次即可

### Rarity skill合约 批量设置技能(set_skills)
一 (重新)运行 node csv.js 会生成 rarity_skills.cmd和rarity_skills.sh脚本

二 Linux下第一次运行时先执行chmod +x rarity_skills.sh, 然后运行 
  
  ```
  ./rarity_skills.sh 你的帐号私钥
  ```
  
  Windows下直接运行
  
  ```
  .\rarity_skills.cmd 你的帐号私钥
  ``` 

执行以上命令即可批量设置技能[set_skills]

* 每个Summoner根据职业不同默认拥有36项技能中的某些技能，最少5项最多29项, 可以为summoner每一项技能设置点数。每个Summoner根据它的职业、级别、智力(intelligence)计算出一个技能点数(skill points), 新设置的技能总点数不能超过这个skill points. 目前代码用比较固定的算法分配点数，稍后会写一个随机的算法.

### Rarity craft合约 批量地牢冒险(adventure)
地牢冒险(打副本？)已集成到每日的summoner冒险中, 新拉一下代码跑rarity.sh或rarity.cmd即可.

手动地牢冒险:

```
node rarity_craft.js 帐号私钥 adventure token_id
```

### Rarity Crafting合约 批量打装备(craft)
x. (重新)运行 node csv.js 会生成 rarity_approve.cmd, rarity_approve.sh, rarity_crafting.cmd和rarity_crafting.sh脚本

y. 运行脚本

  ```
  ./rarity_approve.sh 你的帐号私钥
  ```

  允许Craft合约内置的summoner transfer你的summoner的GOLD和Craft. 这一步是必须, 否则下一步打装备交易会被reverted. 每个summoner只做成功一次即可.

  Windows下运行脚本命令不单独写了, 参考上面相关内容. 

z. 运行下面命令打装备

  ```
  ./rarity_crafting.sh 你的帐号私钥
  ```

  Crafting的装备有3类101种, 打每种装备要花费不同的GOLD, 每打一次要消耗250经验, 所以你的GOLD和xp不能是0, 同时你的第6项技能值也不能是0. 不满足这3个条件不会去打以节省FTM. 第6项技能值加上调整后的intelligence值再加上一个随机数(小于20)若大于装备dc值， 你才赢得装备. 你的每10个Craft会降低一个dc，dc越小你赢的概率越高. 如果你的第6项技能值加上调整后的intelligence值已经大于装备dc值则100%赢, 否则靠运气. GOOD LUCK

##### 对rarity的简评及如何下载csv文件参见文章 https://k.mirror.xyz/xZbanjDkmORXIOygvV30I28jo27bSsV-g66DrYlr8iY. 感谢E酱～

##### rarity交易市场 https://www.raritysea.io/

Follow me @ https://twitter.com/goldenfiredo. issue里面只报bug不答疑(比如改哪里调整gas), 有问题加我twitter, 尽量及时回复.
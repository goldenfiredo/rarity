## Rarity automation script
#### 1 复制代码 git clone https://github.com/goldenfiredo/rarity.git 到本地
#### 2 进入rarity目录，从ftmscan.com上下载你的ERC721交易记录csv文件，拷贝到本目录下并改名为export.csv
#### 3 运行 node csv.js 生成批处理文件: rarity.cmd和rarity.sh，分别用于Windows和Linux
#### 4 Linux下先执行chmod +x rarity.sh， 然后运行 ./rarity.sh 你的帐号私钥; Windows下直接运行 .\rarity.cmd 你的帐号私钥
#### 5 执行以上命令即可进行批量冒险[adventure]和升级[level-up]，并在svg目录下生成NFT的svg文件, 批处理每小时运行一次。可以自行修改间隔时间(rarity.sh的sleep或rarity.cmd的timeout参数)
#### 6 手动冒险的命令是: node rarity.js 帐号私钥 adventure token_id
#### 7 脚本也支持mint新NFT，命令是: node rarity.js 帐号私钥 summon 职业编号(1-11)
#### * 保证账户里有足够的FTM(1个足够？) 
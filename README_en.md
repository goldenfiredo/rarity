## Rarity automation script

0. The automation script needs to be run in nodejs v12.16.0 or above, node must be installed first.

1. Clone repo to the local

  ```
  git clone https://github.com/goldenfiredo/rarity.git
  ```

2. Enter the rarity directory and install dependency packages

  ```
  cd rarity
  npm install
  ```

3. Download your ERC721 transaction records from https://ftmscan.com, copy .csv file to current directory and rename it to export.csv

4. Run this command

  ```
  node csv.js
  ```
  
  to generate batch files with extension .cmd and .sh, respectively for Windows and Linux

5. Run this command

  ```
  ./rarity.sh your_private_key
  ```

  to adventure, level_up and attack dungeon. Batch processing runs every hour

6. You can adventure manually by running this command

  ```
  node rarity.js your_private_key adventure token_id
  ```

7. Set attributes with this command:

  ```
  ./rarity_attribute.sh your_private_key
  ```

8. Claim GOLD with this command：

  ```
  ./rarity_gold.sh your_private_key
  ```

9. Set skills with this command:

  ```
  ./rarity_skills.sh your_private_key
  ```

##### For a brief comment on rarity and how to download the .csv file, please refer to the article https://k.mirror.xyz/xZbanjDkmORXIOygvV30I28jo27bSsV-g66DrYlr8iY. Many thanks to @ecrivaine_k

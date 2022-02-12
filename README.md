This a blockchain learning projects

## Getting Dev Started

- npx create-next-app blog && cd blog
- npm install ethers hardhat @nomiclabs/hardhat-waffle \
  ethereum-waffle chai @nomiclabs/hardhat-ethers \
  web3modal @walletconnect/web3-provider \
  easymde react-markdown react-simplemde-editor \
  ipfs-http-client @openzeppelin/contracts
- Initialize hardhat
  - npx hardhat
  - then configure the hardhat.config file for local development
- Complete the smart contract and test it
  - npx hardhat node => import the first test account to your metamask wallet for further testing
  - npx hardhat test
  - npx hardhat run scripts/deploy.js --network localhost
- Now complete the frontend part using the localhost deployed contract
- After everything is completed deploy it on Polygon test (use this for low gas fees)

### Additional Steps

- Configuring graphs for faster querying

require("@nomicfoundation/hardhat-toolbox");

const metamask_private_key ="0x"+""; //enter your own private key
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    hardhat:{},
    polygon_mumbai: {
      url:"", //enter your own url
      accounts:[metamask_private_key
      ],
    },
  },
};

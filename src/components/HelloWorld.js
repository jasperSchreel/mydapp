import Authereum from "authereum";
import Web3 from "web3";
import * as ethutil from "ethereumjs-util";
// import * as validator from "is-valid-signature";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      provider: undefined,
      web3: undefined,
      userConnected: false,
      message: "",
      log: "",
      accounts: {},
      network: "kovan",
      User: {
        nonce: Math.floor(Math.random() * 1000000), // init with random number as nonce,
        publicAddress: undefined,
        username: "username",
        signature: undefined
      },
      currentUser: undefined
    };
  },
  mounted() {
    console.log("hi");

    this.web3;
    if (window.ethereum) {
      // metamask
      console.log("windows.ethereum");
      this.ethereum = window.ethereum;
      this.web3 = new Web3(window.ethereum);
      this.provider = window["ethereum"];
      console.log(this.ethereum.isMetaMask);
    } else if (window.web3) {
      console.log("windows.web3");
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log("not ethereum nor web3");
      this.login().then(this.asyncCall);
    }
  },
  methods: {
    async asyncCall() {
      console.log("calling");
      //    await this.provider.enable();
      this.accounts = await this.web3.eth.getAccounts();
      console.log(this.accounts[0]);
      const cbase = await this.web3.eth.getCoinbase();
      console.log("coinbase: " + cbase);
    },
    async connectMetaMask() {
      this.accounts = await this.ethereum.enable();
      console.log(this.accounts);
    },
    async login() {
      this.authereum = new Authereum({
        networkName: this.network,
        apiKey: "9wUdS-WuJx0zKCVC5xXU3p47lg1XhziU"
      });
      await this.authereum.login();
      this.provider = this.authereum.getProvider();
      console.log(this.provider);
      await this.provider.enable();
      this.web3 = new Web3(this.provider);
      console.log(this.web3);
      this.log = "Logged in.";
    },
    async logout() {
      await this.provider.disable();
      this.log = "Logged out.";
    },
    isConnected() {
      this.userConnected = this.provider.isConnected();
      console.log(this.userConnected);
      if (this.userConnected) {
        this.log = "User is authorized";
      } else {
        this.log = "User is not authorized";
      }
    },
    // signing a message
    async signMessage() {
      this.signature = await this.web3.eth.personal.sign(
        this.message,
        this.accounts[0],
        (error, signature) => {
          console.log(signature);
          //signatureSpan.innerHTML = signature;
          this.signature = signature;
          // send it to backend to verify it
          this.verifySignatureAuthereum();
        }
      );
      this.log = "Message signed with resulting signature: ";
      this.log += this.customSplit(this.signature, 25);
    },
    addLog(message) {
      this.log += message;
    },
    customSplit(str, maxLength) {
      if (str.length <= maxLength) return str;
      var reg = new RegExp(".{1," + maxLength + "}", "g");
      var parts = str.match(reg);
      return parts.join("\n");
    },
    async authenticate() {
      this.publicAddress = await this.web3.eth.getCoinbase();
      console.log(this.publicAddress);
      this.currentUser = this.User;
      this.currentUser.publicAddress = this.publicAddress;
      console.log(this.currentUser);
      //nonceSpan.innerHTML = currentUser.nonce;

      // signature verification (backend)

      console.log(this.web3);
      // Handle Sign message
      const handleSignMessage = () => {
        return new Promise((resolve, reject) =>
          this.web3.eth.personal.sign(
            this.web3.utils.fromUtf8(
              `Do you want to sign this app with nonce: ${this.currentUser.nonce}?`
            ),
            this.publicAddress,
            (err, signature) => {
              if (err) return reject(err);
              console.log(signature);
              //signatureSpan.innerHTML = signature;
              this.currentUser.signature = signature;

              // send it to backend to verify it
              this.verifySignature();
            }
          )
        );
      };
      // call function then send it to backend
      handleSignMessage();
    },
    async verifySignatureAuthereum() {
      const ethers = require("ethers");

      const provider = ethers.getDefaultProvider("kovan");

      const eip1271Abi = [
        {
          constant: true,
          inputs: [
            {
              name: "_messageHash",
              type: "bytes"
            },
            {
              name: "_signature",
              type: "bytes"
            }
          ],
          name: "isValidSignature",
          outputs: [
            {
              name: "magicValue",
              type: "bytes4"
            }
          ],
          payable: false,
          stateMutability: "view",
          type: "function"
        }
      ];

      const data = "0x" + Buffer.from(this.message).toString("hex");
      console.log(data);
      const magicValue = "0x20c13b0b";
      const instance = new ethers.Contract(
        this.accounts[0],
        eip1271Abi,
        provider
      );
      const result = await instance.isValidSignature(data, this.signature);
      console.log(result);
      const verified = result === magicValue;

      console.log(verified); // true
    },
    async verifySignature() {
      // backend knows what msg he originally sended
      const msg = this.web3.utils.fromUtf8(
        `Do you want to sign this app with nonce: ${this.currentUser.nonce}?`
      );
      console.log("message: " + msg);
      // now that we have a msg, publicAddress and signature.
      // lets perform an elliptic curve signature verification with ecrecover
      const msgBuffer = ethutil.toBuffer(msg);
      const msgHash = ethutil.hashPersonalMessage(msgBuffer);
      const signatureBuffer = ethutil.toBuffer(this.currentUser.signature);
      const signatureParams = ethutil.fromRpcSig(signatureBuffer);
      const publicKey = ethutil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
      );
      const addressBuffer = ethutil.publicToAddress(publicKey);
      const address = ethutil.bufferToHex(addressBuffer);

      // The signature verification is successful if the address found with
      // ecrecover matches the initial publicAddress
      if (address.toLowerCase() === this.publicAddress.toLowerCase()) {
        console.log("valid authentication");
        return this.currentUser;
      } else {
        return undefined;
      }
    }
  }
};

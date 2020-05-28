<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button v-on:click="login" href="#">LOGIN to Authereum</button>
    <button class="enableEthereumButton" v-on:click="connectMetaMask">
      Enable Ethereum
    </button>
    <br />
    <a v-on:click="logout" href="#">LOGOUT</a>
    <br />
    <a v-on:click="isConnected" href="#"> Check if Connected</a>
    <br />
    <br />
    <input v-model="message" placeholder="edit me" />
    <p>Message is: {{ message }}</p>
    <button v-on:click="signMessage">SIGN</button>
    <br />
    <br />
    <button v-on:click="authenticate">One-click Login</button>
    <br />
    <br />
    <br />
    <p>{{ log }}</p>
    <p><b>Accounts</b></p>
    <ul id="example-1">
      <li v-for="account in accounts" :key="account">
        {{ account }}
      </li>
    </ul>
  </div>
</template>
<script src="../components/HelloWorld.js"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

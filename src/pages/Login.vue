<template>
  <q-page class="flex flex-center">
    <q-card dark bordered>
      <q-card-section v-if="loginMode">
          <div v-if="filename.length === 0" class="pgp-input" @click="selectFile">Click here to select key file.</div>
          <div v-else class="text-green"><br>
            <q-input filled dark readonly v-model="nickname" label="Nickname" class="full-width"></q-input>
            <q-input  filled dark readonly v-model="loginKey" label="Login key"  class="full-width"></q-input>
            <q-input filled dark  readonly v-model="publicKey" label="Public key"  class="full-width"></q-input>
            <q-input  filled dark readonly v-model="privateKey" label="Private key"  class="full-width"></q-input>
            <div v-if="filename.length > 0" class="pgp-input-small" @click="selectFile">File: {{ filename }}</div>
        </div>
      </q-card-section>
      <q-card-section v-else class="login-dialog">
          <q-input label="Nickname" class="full-width" dark filled name="nickname"  color="yellow" v-model="nickname_newacc" maxlength="15" :rules="[ (val) => val.match(/^[a-zA-Z0-9]{5,15}$/) || 'Only A-Z, a-z, 0-9 chars allowed, min len - 5' ]"/>
          <q-input  filled dark readonly v-model="new_loginKey" label="Login key"  class="full-width"></q-input>
          <q-input filled dark  readonly v-model="new_publicKey" label="Public key"  class="full-width"></q-input>
          <q-input  filled dark readonly v-model="new_privateKey" label="Private key"  class="full-width"></q-input>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat style="min-width: 150px;" @click="tryAuth" v-if="loginKey.length > 0 && loginMode"  text-color="yellow">Login to server</q-btn>
        <q-btn flat style="min-width: 150px;" @click="generateNewAccount" v-if="nickname_newacc.length < 5"  text-color="yellow">New account</q-btn>
        <q-btn flat style="min-width: 150px;" @click="downloadAndLogin" v-if="nickname_newacc.length >= 5" text-color="yellow">Register & download keys</q-btn>
        <br>

      </q-card-actions>
    </q-card>

    <input type="file" style="display: none;" ref="pgpfile" @change="readKeyFile" />
    <a href="#" style="display: none" ref="pgpLinkFile"></a>
  </q-page>
</template>

<script>
import { encrypt, decrypt, sharedA, sharedB, decodeKey, generateKeyPairJson } from '../encryption'
import axios from 'axios'
import ServerObserver from '../ServerObserver'
import { useQuasar } from 'quasar'

export default {
  name: 'Login',
  data: () => ({
    loginMode: true,
    nickname: '',
    nickname_newacc: '',
    useLocalStorage: 1,
    filename: '',
    publicKey: '',
    privateKey: '',
    new_publicKey: '',
    new_privateKey: '',
    loginKey: '',
    new_loginKey: '',
    keyData: {}
  }),
  mounted () {
    this.$store.commit('global/windowText','Login');
    if( localStorage.getItem('key') )
    {
      const keyData = JSON.parse(localStorage.getItem('key'));
      console.log('keydata=',keyData);
      this.extractKeyData(keyData);
    }
  },
  setup () {
    const q = useQuasar()
    return {
      showNotify (message) {
        q.notify({
          message,
          color: 'red'
        })
      }
    }
  },
  methods: {

    makeId (length) {
      let result = ''
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
          charactersLength))
      }
      return result
    },


    generateNewAccount(){

      this.loginMode = false;
      this.nickname_newacc = '';
      const keyPairs = generateKeyPairJson();

      this.new_loginKey = this.makeId(64)
      this.new_publicKey = keyPairs.publicKey;
      this.new_privateKey = keyPairs.secretKey;

    },

    downloadAndLogin () {
      axios
        .post('/reg', {
          nickname: this.nickname_newacc,
          key: this.new_loginKey
        })
        .then((res) => {
          if (res.data.result === 1) {

            const keyPairs = generateKeyPairJson();
            const publicKey = keyPairs.publicKey;
            const privateKey = keyPairs.secretKey;

            const keyData = {
              publicKey: this.new_publicKey,
              privateKey: this.new_privateKey,
              nickname: this.nickname_newacc,
              loginKey: this.new_loginKey
            };

            const fileContent = btoa(JSON.stringify(keyData))

            const blob = new Blob([fileContent], { type: 'octet/stream' })
            this.$refs.pgpLinkFile.href = window.URL.createObjectURL(blob)
            this.$refs.pgpLinkFile.download = 'schat_' + this.nickname_newacc + '.key'
            this.$refs.pgpLinkFile.click()

            this.keyData = keyData;
            this.nickname = this.keyData.nickname;
            this.publicKey = this.keyData.publicKey;
            this.privateKey = this.keyData.privateKey;
            this.loginKey = this.keyData.loginKey;

            this.tryAuth();

          } else {
            this.showNotify(res.data.data);
          }
        })
    },

    toBase64(u8) {
      return btoa(String.fromCharCode.apply(null, u8));
    },

    fromBase64 (str) {
      return atob(str).split('').map(function (c) { return c.charCodeAt(0); });
    },

    selectFile () {
      this.$refs.pgpfile.click()
    },

    readKeyFile () {

      const keyFile = this.$refs.pgpfile.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        const key = reader.result
        try {
          const keyData = JSON.parse(atob(key));
          this.filename = keyFile.name;
          this.extractKeyData(keyData)
        }
        catch
        {
            this.showNotify('Invalid key file.')
            this.filename = '';
            this.$refs.pgpfile.files[0] = null;
        }

      }
      reader.readAsText(keyFile)
    },


    tryAuth()
    {
      const socket = ServerObserver.getInstance();

      if(this.useLocalStorage)
      {
        localStorage.setItem('key',JSON.stringify( this.keyData ));
      }

        socket.connect()
        .then(()=>{
          socket.callMethodAsync('authorize',{ nickname: this.nickname, loginKey: this.loginKey, publicKey: this.publicKey })
          .then(()=>{
            this.$store.commit('global/setNickname', this.nickname)
            this.$store.commit('global/setKeyData',this.keyData)
            this.$store.commit('global/setLoggedIn',true)

            if(this.$route.params.invite === undefined) {
              this.$router.push({ path: '/new' });
            }
            else
            {
              socket.callMethodAsync('joinByLink', { link: this.$route.params.invite })
                .then((res) => {
                  this.$router.push( { path: '/room/' + res.data.uuid } );
                })
                .catch((err) => {
                  this.showNotify(err.data);
                  this.$router.push({ path: '/new' });
                })
            }
          })
          .catch((err)=>{
             localStorage.removeItem('key');
             console.log(err);
             this.showNotify(err.data ?? err);
          })
      });
    },

    extractKeyData(keyData)
    {
      console.log(keyData);
      if (
        !( keyData.hasOwnProperty('nickname') &&
          keyData.hasOwnProperty('publicKey') &&
          keyData.hasOwnProperty('privateKey') &&
          keyData.hasOwnProperty('loginKey') )
       ) {
        this.showNotify('Invalid keyfile.')
        return false;
      }
      this.keyData = keyData;
      this.nickname = this.keyData.nickname;
      this.publicKey = this.keyData.publicKey;
      this.privateKey = this.keyData.privateKey;
      this.loginKey = this.keyData.loginKey;
    }

  }
}
</script>

<style>
.pgp-input {
  text-align: center;
  vertical-align: middle;
  width: 400px;
  height: 270px;
  line-height: 270px;
  font-size: 1.2em;
  background-color: rgba(0,255,0,0.02);
  border-radius: 3px;
  border: solid 1px #0f5b0f;
  cursor: pointer;
}
.pgp-input-small {
  text-align: center;
  vertical-align: middle;
  width: 400px;
  height: 30px;
  line-height: 30px;
  font-size: 1.2em;
  background-color: rgba(0,255,0,0.02);
  border-radius: 3px;
  border: solid 1px #0f5b0f;
  cursor: pointer;
}

.login-dialog {
  width: 400px;
  height: 270px;
}
</style>

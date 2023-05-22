<template>
  <q-page class="flex flex-center">
    <div class="text-h5">You are logged out.</div>
  </q-page>
</template>

<script>
import nacl from 'tweetnacl'
import axios from 'axios'
import { getSocket } from '../ServerObserver'
import { useQuasar } from 'quasar'

export default {
  name: 'Logout',
  data: () => ({
  }),
  mounted () {
    const socket = getSocket();
    socket.callMethodAsync('logout',{})
    .then(()=>{
      socket.close();
    });
    localStorage.removeItem('key');
    this.$store.commit('global/setNickname', '')
    this.$store.commit('global/setKeyData',{})
    this.$store.commit('global/setLoggedIn',false)
    this.$store.commit('global/windowText','Logout');
    this.$store.commit('global/reset');
  }
}
</script>

<style>

</style>

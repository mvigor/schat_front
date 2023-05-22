<template>
  <router-view />
</template>
<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import axios from 'axios'
import ServerObserver, { getSocket } from 'src/ServerObserver'
import { useQuasar } from 'quasar'
export default {
  name: 'App',
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
  mounted () {
    const socket = getSocket();

    socket.subscribe('stop_channel',(event,params)=>{
      this.$store.commit('global/removeChannel',{ uuid: params.uuid });
    });

    socket.subscribeR(['createRoom','start_channel'],(event, params) => {

      let rooms = this.getRooms;
      if( rooms.findIndex((room) => room.uuid === params.uuid)  === -1)
      {
        this.$store.commit('global/addRoom', {
            title: params.title,
            uuid: params.uuid,
            public_key: params.public_key,
            private_key: params.private_key,
          });
      }
//        console.log('subscribe to',params.uuid);
      socket.subscribeChannel(params.uuid,(channel_id, type, data) => {
        //          console.log('got new ',type,channel_id, data);

        if(type === "message")
          this.$store.commit('global/addMessage',{ channel_id, data });

        if(type === "userlist")
          this.$store.commit('global/setUserlist',{ channel_id, data });

      })
    });


    socket.subscribe('ping',(event,params) => {
      socket.callMethod('pong',{});
    });

    axios
      .post('/settings',{})
      .then((res) => {
        let socket_port = res.data.socket_port;
          socket.setServer( 'ws://' + window.location.hostname + ':' + socket_port + "/" )
          .then(()=>{
            this.tryAuth();
          });
      });
  },
  computed: {
    ...mapGetters('global', ['getIsLoggedIn','','getNickname', 'getKeyData', 'getRooms'])
  },
  methods: {
    tryAuth()
    {
      const socket = getSocket();
      if( localStorage.getItem('key') ) {
        const keyData = JSON.parse(localStorage.getItem('key'));
        socket.connect()
        .then(()=>{
          socket.callMethodAsync('authorize', {
            nickname: keyData.nickname,
            loginKey: keyData.loginKey,
            publicKey: keyData.publicKey
          })
            .then((res) => {
              console.log('res=',res);
              this.$store.commit('global/setNickname', keyData.nickname)
              this.$store.commit('global/setKeyData', keyData)
              this.$store.commit('global/setLoggedIn', true)
              this.$store.commit('global/setRole', res.data.role);
            })
            .catch((err) => {
              this.showNotify(err.data);
            })
        });
      }
    },
  }

};
</script>

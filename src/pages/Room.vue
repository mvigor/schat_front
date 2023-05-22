<template>
  <q-page class="chat-page">
    <div class="flex-container">
      <div class="flex-chat-dialog">
        <div class="chat-dialog">
          <div v-for="message in messages" :key="message.id">
            <q-chat-message v-if="message.text"  :label="message.label"
                          :name="message.name" :sent="message.name === getNickname"  :stamp="toHumanDate(message.stamp)">
                <pre class="message-text">{{ message.text }}</pre>
            </q-chat-message>
            <q-chat-message v-else :label="message.label" />
          </div>
        </div>

      </div>
      <div class="flex-chat-users">
        <q-list>
          <q-item-label header>
            Users list
          </q-item-label>

          <q-item dark clickable tag="a" v-for="user in users">
            <q-menu auto-close dark>
              <q-list style="min-width: 100px">

                <q-item clickable v-close-popup @click="kickUser(user)">
                  <q-item-section>Kick</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="setModerator(user)">
                  <q-item-section>Moderator</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="setUser(user)">
                  <q-item-section>User</q-item-section>
                </q-item>

              </q-list>
            </q-menu>
            <!--<q-item-section avatar >
              <q-icon name="user" class="text-green" />
            </q-item-section>-->
            <q-item-section avatar>
              <q-avatar :color="(user.status == 'admin' ? 'red' : user.status == 'moderator' ? 'yellow' :  'grey')" text-color="black">
                {{ user.nickname.toUpperCase().substr(0,1) }}
              </q-avatar>
            </q-item-section>

              <q-item-section class="text-accent">{{ user.nickname }}</q-item-section>
          </q-item>

        </q-list>
        <q-btn label="Create invite link" flat class="full-width" @click="show_dialog_invite"></q-btn>
        <q-btn label="Leave room" flat class="full-width" color="yellow" @click="leave"></q-btn>
      </div>
    </div>

    <div class="q-pa-md row text-center chat-input" style="max-height: 20px;">
      <q-input
        v-model="my_message"
        dark
        filled
        type="textarea"
        color="green"
        label="Message"
        class="full-width"
        maxlength="5000"
        @keydown.enter="handleEnter"
      />
    </div>

    <q-dialog v-model="dialog_invite_link" persistent style="width: 500px;">
      <q-card dark style="width: 500px;">
        <q-card-section>
          <div class="text-h6">Invite link</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="items-center">
          <q-input readonly dark label="link" v-model="invite_link" maxlength="25"></q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat dark label="Close"  v-close-popup />
          <q-btn flat dark label="Copy"  @click="copy_link" />
          <q-btn flat dark label="Request"  @click="request_link" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <input type="hidden" v-model="invite_link"  ref="clipboard_field">
  </q-page>
</template>
<script>
import { mapGetters  } from 'vuex';
import moment from 'moment';
import { getSocket } from 'src/ServerObserver'
import { getRooms } from 'src/store/global/getters'
import { encrypt, decrypt, sharedA, sharedB, decodeKey } from '../encryption'
import { useQuasar } from 'quasar'

export default {
  name: 'Room',
  data: () => ({
    my_message: '',
    chat: [],
    dialog_invite_link: false,
    invite_link: '',
    title: '',
    roomPublicKey: ''
  }),
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

  },
  methods: {
    kickUser(user){
      const socket = getSocket();
      socket.callMethodAsync('kick',{channel_id: this.$route.params.id, nickname: user.nickname})
        .then(()=>{})
        .catch((err)=>{
          this.showNotify(err.data);
        });
    },
    setModerator(user){
      const socket = getSocket();
      socket.callMethodAsync('setModerator',{channel_id: this.$route.params.id, nickname: user.nickname})
        .then(()=>{})
        .catch((err)=>{
          this.showNotify(err.data);
        });
    },
    setUser(user){
      const socket = getSocket();
      socket.callMethodAsync('setUser',{channel_id: this.$route.params.id, nickname: user.nickname})
        .then(()=>{})
        .catch((err)=>{
          this.showNotify(err.data);
        });
    },
    leave(){
      const socket = getSocket();
      socket.callMethodAsync('leave',{channel_id: this.$route.params.id})
        .then(()=>{
          this.$router.push({ path: '/new' });
        })
        .catch((err)=>{
          this.showNotify(err.data);
        });
    },
    show_dialog_invite() {

      this.dialog_invite_link = true;
    },
    handleEnter (e) {
      if (e.altKey) {
        this.my_message = this.my_message + '\n'
        return
      }

      this.my_message = this.my_message.trim();
      if ( this.my_message.length < 2 ) {
        e.preventDefault()
        return;
      }

      let chat = this.getRooms.find((e)=>e.uuid === this.$route.params.id)

      let msg = encrypt( sharedA( decodeKey( this.getKeyData.privateKey ), decodeKey( chat.public_key ) ), this.my_message);

      const socket = getSocket();
      socket.callMethod('sendMessage',{channel_id: this.$route.params.id, text: msg });
      this.my_message = ''
      e.preventDefault()
      console.log('Send', e)
    },
    toHumanDate(date)
    {
      return moment(date).format('HH:mm');
    },
    request_link()
    {
      const socket = getSocket();
      socket.callMethodAsync('createInviteLink',{channel_id: this.$route.params.id })
      .then((res)=>{
        this.invite_link = 'http://' + window.location.host + '/#/join/' + res.data.url;
      })
      .catch((err)=>{});

    },
    copy_link()
    {
      let clipboardField = this.$refs.clipboard_field;
      clipboardField.setAttribute('type', 'text')
      clipboardField.select()
      console.log(clipboardField);

      try {
        var successful = document.execCommand('copy');
        console.log(successful)

      } catch (err) {
        console.log('err=',err)
      }
      window.getSelection().removeAllRanges();
      clipboardField.setAttribute('type', 'hidden')
      alert('Link copied.');
    },

  },
  computed: {
      ...mapGetters('global',['getNickname','getRooms', 'getKeyData']),
      messages(){
        let chat = this.getRooms.find((e)=>e.uuid === this.$route.params.id)

        if( chat )
          this.$store.commit('global/windowText','Room [ ' + chat.title + ' ]' );

        const allMessages = this.$store.state.global.messages['c_' + this.$route.params.id] ?? [];

        this.$store.commit( 'global/setMessagesRead',{ uuid: this.$route.params.id, count: allMessages.length } )

        setTimeout(()=>{
          const chatDialog = this.$el.querySelector('.flex-chat-dialog');

          if( chatDialog.scrollTop + chatDialog.clientHeight + chatDialog.clientHeight > chatDialog.scrollHeight)
            chatDialog.scrollTop = chatDialog.scrollHeight;

        }, 100);

        return allMessages;
      },
      users(){
        return this.$store.state.global.userlist['c_' + this.$route.params.id];
      },
  }
}
</script>

<style scoped>
.chat-input {
  position: absolute;
  width: 100%;
}
.flex-container {
  height: calc( 100vh - 230px );
  padding-top: 20px;
  padding-left: 50px;
  padding-right: 5px;
  align-content: center;
  display: flex;
}
.flex-chat-dialog {
  overflow-y: scroll;
  margin: 0px;
  padding: 50px;
  flex: 1 1 auto;
}
.flex-chat-users {
  margin: 5px;
  padding: 5px;
  flex: 0 1 200px;
  min-width: 200px;
}
.message-text {
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 70vw;
}
</style>

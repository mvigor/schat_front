<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar >
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
        />

        <q-toolbar-title>
          Secured chat service <div class="text-accent" style="display: inline;" v-if="getwindowText.length > 0">| {{ getwindowText }}</div>
        </q-toolbar-title>

        <div> </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      bordered
      class="bg-dark"
    >
      <q-list>
        <q-item-label header>Menu</q-item-label>
        <left-menu-item title="Logout" :caption="' Logout [ ' + getNickname + ' ]'" icon="logout" link="#/logout" v-if="getIsLoggedIn"  />
        <left-menu-item title="Login" caption="Login to chat server" icon="login" link="#/login" v-else />
        <left-menu-item title="Create room" caption="Create a new room" icon="add_comment" link="#/new" v-if="getIsLoggedIn" />
        <left-menu-item title="Room list" caption="Show all rooms" icon="comment" link="#/rooms" v-if="getIsLoggedIn && getRole === 1" />
        <left-menu-item title="User list" caption="List of all users" icon="group" link="#/users" v-if="getIsLoggedIn && getRole === 1" />

        <!--<left-menu-item title="Join to room" caption="Join to exist room" icon="comment"  @click="show_joint_dialog" v-if="getIsLoggedIn" />-->

        <left-menu-item v-for="(room,index) in getRooms" key="room.uuid" :title="'Room #'+(index+1)" :unread="getChat['c_' + room.uuid].length - getMessagesRead['c_' + room.uuid]" :caption="room.title" icon="question_answer" :link="'#/room/' + room.uuid" v-if="getIsLoggedIn" />


      </q-list>
    </q-drawer>

    <q-page-container>

      <q-dialog v-model="joinRoomDialog" persistent>
        <q-card dark>
          <q-card-section class="items-center">
            <span class="q-ml-sm">Please input UUID of room you want to join.</span><br>
            <q-input dark label="Room ID" v-model="room_id" maxlength="25"></q-input>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat dark label="Cancel"  v-close-popup />
            <q-btn flat dark label="Join"  v-close-popup @click="join_to_room" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <router-view />

    </q-page-container>
  </q-layout>
</template>

<script>
import LeftMenuItem from 'components/LeftMenuItem'
import { mapGetters } from 'vuex'
import { getSocket } from 'src/ServerObserver'
export default {
  name: 'MainLayout',
  components: {
    LeftMenuItem
  },
  data: ()=>({
      joinRoomDialog: false,
      room_id: ''
  }),
  methods: {
    show_joint_dialog(){
      this.joinRoomDialog = true;
    },
    join_to_room(){
      const socket = getSocket();
      socket.callMethodAsync('joinRoom',{'uuid': this.uuid})
      .then((res)=>{

      })
      .catch((err)=>{
        console.log(err.data)
      })
    }
  },
  computed: {
    ...mapGetters('global', ['getIsLoggedIn','getRooms','getNickname','getwindowText', 'getChat', 'getMessagesRead','getRole'])
  }
}
</script>

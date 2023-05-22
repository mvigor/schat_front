<template>
  <q-page class="flex flex-center">

    <!--- begin table users online -->
    <q-table
      class="user-list"
      bordered
      :title="'Users online (' + rows.length + ')'"
      :rows="rows"
      :columns="columns"
      row-key="nickname"
      dark>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th>Actions</q-th>
        </q-tr>
      </template>


      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>

          <q-td
            align="center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>

          <q-td align="center">
            <q-btn size="sm" text-color="red" round dense @click="kick_user(props.row.nickname)" icon="logout">
                <q-tooltip>Kick user from server.</q-tooltip>
            </q-btn>
            <q-btn size="sm" text-color="yellow" round dense @click="ban_user(props.row.nickname)" icon="fas fa-user-slash">
              <q-tooltip>Kick & disable user</q-tooltip>
            </q-btn>
          </q-td>

        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">

            <div class="text-left row q-mr-2" v-for="(room,index) in props.row.rooms" :key="room.uuid">
              <div class="col-1">{{ index+1 }}</div>
              <div class="col-8">{{ room.title }}</div>
              <div class="col-2">Users: {{ room.users }}</div>
              <div class="col-1">
                <q-btn size="sm" text-color="red" round dense @click="kick_user(props.row.nickname, room.uuid)" icon="logout">
                  <q-tooltip>Kick user from this channel</q-tooltip>
                </q-btn>

                <q-btn size="sm" text-color="blue" round dense @click="join_room(room.uuid)" icon="login">
                  <q-tooltip>Join to this channel</q-tooltip>
                </q-btn>

              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

     </q-table>

    <!--- end of table users online -->

    <q-table
      class="user-list"
      bordered
      :title="'Users (' + rows.length + ')'"
      :rows="rows_users"
      :columns="columns_userlist"
      row-key="nickname"
      dark>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
          <q-th>Actions</q-th>
        </q-tr>
      </template>


      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td align="center" key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td align="center" key="nickname" :props="props">
            {{ props.row.nickname }}
          </q-td>

          <q-td align="center" key="admin" :props="props">
            <span class="cursor-pointer"> {{ props.row.admin === 0 ? 'No' : 'Yes' }}</span>
            <q-popup-edit v-model="account_admin" title="Is admin account?" @before-show="updateAdmin(props.row)">
              <q-checkbox v-model="account_admin" label="Admin account"  @update:model-value="updateUser(props.row.nickname, $event)" />
            </q-popup-edit>
          </q-td>

          <q-td align="center" key="disabled" :props="props">
            <span class="cursor-pointer">{{ props.row.disabled === 0 ? 'No' : 'Yes' }}</span>
            <q-popup-edit v-model="account_disabled" title="Account disabled"  @before-show="updateDisabled(props.row)" >
              <q-checkbox v-model="account_disabled" label="Account disabled" left-label @update:model-value="set_user_state(props.row.nickname, $event)"/>
            </q-popup-edit>
          </q-td>

          <q-td align="center" key="createdAt" :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>

          <q-td align="center">
            <q-btn size="sm" text-color="red" round dense @click="kick_user(props.row.nickname)" icon="logout">
              <q-tooltip>Kick user from server.</q-tooltip>
            </q-btn>
          </q-td>

        </q-tr>
      </template>

    </q-table>



  </q-page>
</template>

<script>
import { getSocket } from 'src/ServerObserver'
import moment from 'moment'
import { useQuasar } from 'quasar'
import { ref } from 'vue';

export default {
  name: 'Users',
  setup () {
    const account_admin = ref(false);
    const account_disabled = ref( false);

    const q = useQuasar()
    return {
      account_admin,
      account_disabled,
      updateDisabled(row){
        account_disabled.value = row.disabled === 1;
      },
      updateAdmin(row){
        account_admin.value = row.admin === 1;
      },
      showNotify (message) {
        q.notify({
          message,
          color: 'red'
        })
      }
    }
  },
  data:() => ({
    rows: [],
    rows_users: [],
    columns: [
      { name: 'nickname', label: 'Nickname', sortable: true, field: 'nickname' } ,
      { name: 'started', label: 'Started', field: 'started', format: val=>`${moment(val).format('DD.MM.YYYY HH:mm:ss')}`, sortable: true },
      { name: 'rooms_count', label: 'Joined rooms', field: 'rooms_count' }
    ],
    columns_userlist: [
      { name: 'id', label: 'ID', sortable: true, field: 'id' } ,
      { name: 'nickname', label: 'Nickname', field: 'nickname', sortable: true },
      { name: 'admin', label: 'Is admin', field: 'admin', format: val => `${val === 1 ? 'Yes': 'No'}`, sortable: true },
      { name: 'disabled', label: 'Disabled', field: 'disabled', format: val => `${val === 1 ? 'Yes': 'No'}`, sortable: true },
      { name: 'createdAt', label: 'Registered', field: 'createdAt', format: val => `${moment(val).format('DD.MM.YYYY HH:mm')}`, sortable: true}
    ],
    hTimer: 0
  }),
  mounted () {
    this.load_list();
    this.hTimer = setInterval(this.load_list,5000);
  },
  unmounted () {
    clearInterval(this.hTimer);
  },
  methods: {
    formatDate: (dt) => moment(dt).format('DD.MM.YYYY HH:mm'),
    kick_user(nickname, uuid = null){
      const socket = getSocket();

      if(uuid == null) {
        socket.callMethodAsync('kickFromServer', { nickname })
          .then(() => {
            this.load_list()
          })
          .catch((err) => {
            this.showNotify(err.data)
          })
          return;
      }

      socket.callMethodAsync('kickFromChannel', { nickname, uuid })
        .then(() => {
          this.load_list()
        })
        .catch((err) => {
          this.showNotify(err.data)
        })


    },
    ban_user(nickname){
      const socket = getSocket();
      socket.callMethodAsync('banUser', { nickname })
        .then(()=>{
          this.load_list()
        })
        .catch((err)=>{
          this.showNotify(err.data)
        })
    },
    set_user_state(nickname,state){
      const socket = getSocket();
      socket.callMethodAsync('setUserState', { nickname,state: state ? 1 : 0 })
        .then(()=>{
          this.load_list()
        })
        .catch((err)=>{
          this.showNotify(err.data)
        })
    },
    set_admin_user(nickname){
      const socket = getSocket();
      socket.callMethodAsync('setAdmin', { nickname })
        .then(()=>{
          this.load_list()
        })
        .catch((err)=>{
          this.showNotify(err.data)
        })
    },
    set_user(nickname){
      const socket = getSocket();
      socket.callMethodAsync('setUser', { nickname })
        .then(()=>{
          this.load_list()
        })
        .catch((err)=>{
          this.showNotify(err.data)
        })
    },
    join_room(uuid){
      const socket = getSocket();
      socket.callMethodAsync('joinRoom', { uuid })
        .then(()=>{
          this.load_list()
        })
    },
    updateUser(nickname,event) {
      console.log('updateUser',nickname,event);
      if(event)
        this.set_admin_user(nickname)
      else
        this.set_user(nickname)

    },
    load_list(){
      const socket = getSocket();
      socket.callMethodAsync('showUsers')
      .then((res)=>{
        console.log(res.data);
        this.rows = res.data.users_online;
        this.rows_users = res.data.users;
        console.log(this.rows);
      })
      .catch((err)=>{
        //alert(err.data)
      });
    }
  }
}
</script>

<style scoped>
.user-list {
  max-width: 900px;
  width: 80%;
  min-width: 500px;
}
</style>

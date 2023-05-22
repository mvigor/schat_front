<template>
  <q-page class="flex flex-center">

    <!--- begin table users online -->
    <q-table
      class="rooms-list"
      bordered
      :title="'Active rooms (' + rows.length + ')'"
      :rows="rows"
      :columns="columns"
      row-key="id"
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
          <q-td
            align="center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>

          <q-td align="center">
            <q-btn size="sm" text-color="blue" round dense @click="join_room(props.row.uuid)" icon="login">
              <q-tooltip>Join to this channel</q-tooltip>
            </q-btn>
          </q-td>

        </q-tr>
      </template>

    </q-table>
    <!--- end of table users online -->
  </q-page>

</template>

<script>
import moment from 'moment'
import { getSocket } from 'src/ServerObserver'

export default {
  name: 'Rooms',
  data:() => ({
    rows: [],
    columns: [
      { name: 'id', label: 'ID', sortable: true, field: 'id' } ,
      { name: 'title', label: 'Room title', field: 'title', sortable: true },
      { name: 'admin', label: 'Admin', field: 'admin',  sortable: true },
      { name: 'users', label: 'Users count', field: 'users_count',  sortable: true },
      { name: 'createdAt', label: 'Created', field: 'createdAt', format: val => `${moment(val).format('DD.MM.YYYY HH:mm')}`, sortable: true}
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
    load_list(){
      const socket = getSocket();
      socket.callMethodAsync('showRooms')
        .then((res)=>{
          console.log(res);
          this.rows = res.data.active_rooms;
        })
        .catch((err)=>{
          //alert(err.data)
        });
    },
    join_room(uuid){
      const socket = getSocket();
      socket.callMethodAsync('joinRoom', { uuid })
        .then(()=>{
          this.load_list()
        })
    },

  }
}
</script>

<style scoped>

</style>

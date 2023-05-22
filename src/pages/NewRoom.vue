<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md text-white" style="max-width: 400px">


      <q-card dark bordered style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Create new room</div>
        </q-card-section>
        <q-card-section>
        <q-input
          dark
          filled
          v-model="title"
          label="Room title"
          lazy-rules
          :rules="[ val => val && val.trim().match(/^[a-zA-Z0-9\s!\,\.\#]{5,25}$/) || 'Please type title min 5, max 25, allowed chars are a-zA-Z0-9']"
        />
        </q-card-section>
        <q-card-actions>
          <div class="text-center full-width">
            <q-btn dark label="Create" type="button" @click="createNewRoom" style="min-width: 150px;" />
          </div>
        </q-card-actions>
      </q-card>

    </div>
  </q-page>
</template>

<script>
import { getSocket } from 'src/ServerObserver'
export default {
  name: 'NewRoomLayout.vue',
  data: ()=>({
    title: ''
  }),
  mounted () {
    this.$store.commit('global/windowText','New room');
  },
  methods:{
    createNewRoom() {
      const socket = getSocket();
      socket.callMethodAsync('createRoom', { title: this.title.trim() })
      .then((res) => {
        console.log( res );
        this.title = '';
        this.$router.push({ path: '/room/' + res.data.uuid });
      })
      .catch((err)=>{
        console.log( err.data );
      })
    }
  }
}
</script>

<style scoped>

</style>

<template>
  <q-page class="flex flex-center">
    <div v-if="isLoggedIn" class="text-h5 text-center">
      Hello,{{ getNickname }}.<br>Please wait...  Joining to channel...
    </div>
    <div v-else>
      Please, login first.
    </div>
  </q-page>
</template>

<script>
import { getSocket } from 'src/ServerObserver'
import { mapGetters } from 'vuex';

export default {
  name: 'PageIndex',
  mounted () {
    if( this.$route.params.id !== undefined && !this.isLoggedIn ) {
        this.$router.push( { path: '/login/' + this.$route.params.id })
    }

    if(this.$route.params.id === undefined && !this.isLoggedIn)
    {
      this.$router.push( { path: '/login' } );
    }

    if(this.$route.params.id === undefined && this.isLoggedIn)
    {
      this.$router.push( { path: '/new' } );
    }

    if(this.isLoggedIn)
      this.onLoggedIn();
  },
  methods: {
      onLoggedIn(){

        const socket = getSocket()
        socket.callMethodAsync('joinByLink', { link: this.$route.params.id })
          .then((res) => {
            this.$router.push( { path: '/room/' + res.data.uuid } );
          })
          .catch((err) => {

          })

      }
  },
  computed: {
    ...mapGetters( 'global',['getNickname','getIsLoggedIn']),
    isLoggedIn(){
      if ( this.$store.state.global.logged_in ) this.onLoggedIn();
      return this.$store.state.global.logged_in
    }
  }
}
</script>

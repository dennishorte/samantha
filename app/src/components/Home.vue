<template>
  <div class="home">
    <Sidebar />
    <Chat />
  </div>
</template>

<script>
import Chat from './Chat'
import Sidebar from './Sidebar'

export default {
  name: 'Home',

  components: {
    Chat,
    Sidebar,
  },

  data() {
    return {
      user: this.$store.getters['auth/user'],
    }
  },

  provide() {
    return {
      user: this.user,
    }
  },
}
</script>


<style scoped>
.home {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
}
</style>

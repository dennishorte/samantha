<template>
  <div class="home">
    <Sidebar />
    <Chat :thread="threads[0]" @message-input="sendMessage" />
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
      threads: [this.newThread()],
      user: this.$store.getters['auth/user'],
    }
  },

  provide() {
    return {
      user: this.user,
    }
  },

  methods: {
    newThread() {
      return {
        _id: null,
        messages: [],
      }
    },

    async sendMessage(text) {
      const response = await this.$post('/api/message', {
        userId: this.user._id,
        threadId: this.threads[0]._id,
        message: text,
      })

      // Put the updated thread into the first position of the threads list.
      const thread = response.thread

      if (thread) {
        const updated = this.threads.filter(x => x._id === thread._id)
        updated.unshift(thread)
        this.threads = updated
      }
      else {
        console.log('no thread: ' + thread)
        console.log(response)
        alert("didn't get a thread")
      }
    },
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

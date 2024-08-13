<template>
  <div class="home">
    <Sidebar :threads="threads" />
    <Chat
      :thread="activeThread"
      :waitingForResponse="waitingForResponse"
      @message-input="sendMessage" />
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
      waitingForResponse: false,
    }
  },

  computed: {
    activeThread() {
      return this.threads[0]
    },
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
      this.waitingForResponse = true

      this.activeThread.messages.push({
        role: 'user',
        content: text,
        timestamp: Date.now(),
      })

      const response = await this.$post('/api/message', {
        userId: this.user._id,
        threadId: this.threads[0]._id,
        text,
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

      this.waitingForResponse = false
    },
  },

  async mounted() {
    const response = await this.$post('/api/threads', { userId: this.user._id })
    if (response.status === 'success') {
      if (response.threads.length > 0) {
        this.threads = response.threads
      }
    }
    else {
      throw new Error('error fetching threads: ' + response.message)
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

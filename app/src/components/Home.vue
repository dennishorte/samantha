<template>
  <div class="home">
    <Sidebar
      :threads="threads"
      :topics="topics"
      @show-thread="setActiveThread"
    />
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
      activeThreadIndex: 0,
      threads: [this.newThread()],
      topics: [],
      user: this.$store.getters['auth/user'],
      waitingForResponse: false,
    }
  },

  computed: {
    activeThread() {
      return this.threads[this.activeThreadIndex]
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

      this.setThreads(response.threads)
      this.waitingForResponse = false
    },

    setActiveThread({ threadId }) {
      const index = this.threads.findIndex(x => x._id === threadId)
      if (index === -1) {
        alert('invalid thread id')
      }
      else {
        this.activeThreadIndex = index
      }
    },

    setThreads(threads) {
      this.threads = threads
      this.activeThreadIndex = this.threads.length - 1
    }
  },

  async mounted() {
    const response = await this.$post('/api/threads', { userId: this.user._id })
    if (response.status === 'success') {
      this.setThreads(response.threads)
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

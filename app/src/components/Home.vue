<template>
  <div class="home">
    <Sidebar
      :threads="threads"
      :topics="topics"
      @show-thread="setActiveThread"
      @process-thread="processThread"
    />
    <Chat
      :thread="activeThread"
      :waitingForResponse="waitingForResponse"
      @message-input="sendMessage"
    />
  </div>

  <Modal id="topic-picker">
    <template #header>Topic Picker</template>

    <div v-if="processing.loading">
      generating topic list
      <div class="spinner-border text-primary">
        &nbsp;
      </div>

    </div>

    <div v-else v-for="topic in processing.topics">
      {{ topic }}
    </div>
  </Modal>

</template>

<script>
import Modal from '@/components/Modal'

import Chat from './Chat'
import Sidebar from './Sidebar'

export default {
  name: 'Home',

  components: {
    Chat,
    Modal,
    Sidebar,
  },

  data() {
    return {
      activeThreadIndex: 0,
      threads: [this.newThread()],
      topics: [],
      user: this.$store.getters['auth/user'],
      waitingForResponse: false,

      processing: {
        threadId: null,
        loading: false,
        topics: [],
      },
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

    async processThread(threadId) {
      this.processing.loading = true
      this.processing.threadId = threadId

      this.$modal('topic-picker').show()

      const response = await this.$post('/api/process/topics', threadId)

      this.processing.topics = response.topics.topics
      this.processing.loading = false
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

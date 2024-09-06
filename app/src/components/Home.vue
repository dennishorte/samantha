<template>
  <div class="home">
    <Sidebar
      :selected="activeThread"
      :threads="threads"
      :topics="topics"
      @combine-topic="combineTopic"
      @process-thread="processThread"
      @rename-topic="renameTopic"
      @show-thread="setActiveThread"
      @show-topic="setActiveTopic"
    />
    <Chat
      :thread="activeThread"
      :waitingForResponse="waitingForResponse"
      @message-input="sendMessage"
    />
  </div>

  <Modal id="topic-picker" @ok="processTopics">
    <template #header>Topic Picker</template>

    <div v-if="processing.loading">
      generating topic list
      <div class="spinner-border text-primary">
        &nbsp;
      </div>

    </div>

    <div v-else v-for="(topic, index) in processing.topics">
      <div class="topic-picker-option input-group">
        <input class="form-control" v-model="processing.topics[index]" />
        <button class="btn btn-small btn-secondary" @click="removeTopic(topic)">x</button>
      </div>
    </div>
  </Modal>

  <Modal id="topic-renamer" @ok="processRenameTopic">
    <template #header>Rename Topic</template>
    <input class="form-control" v-model="rename" />
  </Modal>

  <Modal id="topic-combiner" @ok="processCombineTopic">
    <template #header>Combine Topic</template>

    <div class="alert alert-danger">
      This cannot be undone.
    </div>


    <div><strong>Merge:</strong> {{ activeThread.name }}</div>
    <div>
      <strong>Into:</strong>
      <select class="form-select" ref="combinetarget">
        <option>---</option>
        <option v-for="topic in topics" :value="topic._id">
          {{ topic.name }}
        </option>
      </select>
    </div>
    <div style="color: #888;">
      "{{ activeThread.name }}" will disappear, and its context will become a part of the selected topic.
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
      activeThreadIndex: -1,
      activeTopicIndex: -1,
      threads: [this.newThread()],
      topics: [],
      user: this.$store.getters['auth/user'],
      waitingForResponse: false,

      processing: {
        threadId: null,
        loading: false,
        origTopics: [],
        topics: [],
      },

      rename: '',
    }
  },

  computed: {
    activeThread() {
      if (this.activeThreadIndex >= 0) {
        return this.threads[this.activeThreadIndex]
      }
      else if (this.activeTopicIndex >= 0) {
        return this.topics[this.activeTopicIndex]
      }
      else {
        return {}
      }
    },
  },

  provide() {
    return {
      user: this.user,
    }
  },

  methods: {
    combineTopic() {
      this.$modal('topic-combiner').show()
    },

    newThread() {
      return {
        _id: null,
        messages: [],
      }
    },

    async processCombineTopic() {
      const target = this.$refs.combinetarget.value.trim()
      if (!target) {
        return
      }

      await this.$post('/api/topics/combine', {
        mergeId: this.activeThread._id,
        intoId: target,
      })

      await this.loadTopics()
    },

    async processRenameTopic() {
      await this.$post('/api/topics/rename', {
        topicId: this.activeThread._id,
        name: this.rename,
      })

      this.activeThread.name = this.rename
    },

    async processThread({ threadId }) {
      this.processing.loading = true
      this.processing.threadId = threadId

      this.$modal('topic-picker').show()

      const response = await this.$post('/api/topics/generate', { threadId })
      this.processing.origTopics = response.topics.topics

      this.resetTopics()
      this.processing.loading = false
    },

    async processTopics() {
      const response = await this.$post('/api/topics/apply', {
        threadId: this.processing.threadId,
        topics: this.processing.topics,
      })
    },

    removeTopic(topic) {
      this.processing.topics = this.processing.topics.filter(x => x !== topic)
    },

    renameTopic() {
      this.rename = this.activeThread.name
      this.$modal('topic-renamer').show()
    },

    resetTopics(topic) {
      this.processing.topics = [...this.processing.origTopics]
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
        this.activeTopicIndex = -1
      }
    },

    setActiveTopic({ topicId }) {
      const index = this.topics.findIndex(x => x._id === topicId)
      if (index === -1) {
        alert('invalid topic id:' + topicId)
      }
      else {
        this.activeTopicIndex = index
        this.activeThreadIndex = -1
      }
    },

    setThreads(threads) {
      this.threads = threads
      this.activeThreadIndex = this.threads.length - 1
    },

    setTopics(topics) {
      this.topics = topics
      this.activeTopicIndex = -1
    },

    async loadThreads() {
      const response = await this.$post('/api/threads', { userId: this.user._id })
      if (response.status === 'success') {
        this.setThreads(response.threads)
      }
      else {
        throw new Error('error fetching threads: ' + response.message)
      }
    },

    async loadTopics() {
      const response = await this.$post('/api/topics/fetch', { userId: this.user._id })
      if (response.status === 'success') {
        this.setTopics(response.topics)
      }
      else {
        throw new Error('error fetching threads: ' + response.message)
      }
    },
  },

  async mounted() {
    await this.loadThreads()
    await this.loadTopics()
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

.topic-picker-option {
  margin-bottom: .25em;
}
</style>

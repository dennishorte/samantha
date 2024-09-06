<template>
  <div class="sidebar">
    <div v-for="thread in threads" class="thread-name">
      <div @click="showThread(thread._id)">{{ threadName(thread) }}</div>
      <div
        v-if="thread.closed && !thread.processed"
        class="badge text-bg-warning"
        @click="process(thread._id)"
      >*</div>
    </div>

    <hr />

    <div v-for="topic in topics" class="topic-item">
      <div class="topic-name" @click="showTopic(topic._id)">{{ topicName(topic) }}</div>
      <div v-if="selected === topic" class="topic-menu">
        <div @click="combineTopic">combine</div>
        <div @click="renameTopic">rename</div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'Sidebar',

  props: {
    threads: Array,
    topics: Array,

    selected: null,
  },

  methods: {
    combineTopic(topic) {
      this.$emit('combine-topic')
    },

    process(threadId) {
      this.$emit('process-thread', { threadId })
    },

    // Assumes that the user is renaming the active topic
    renameTopic(topic) {
      this.$emit('rename-topic')
    },

    showThread(threadId) {
      this.$emit('show-thread', { threadId })
    },

    showTopic(topicId) {
      this.$emit('show-topic', { topicId })
    },

    threadName(thread) {
      return thread.name
    },

    topicName(topic) {
      return topic.name
    }
  },
}
</script>


<style scoped>
.sidebar {
  width: 260px;
  padding: 1em;
  background-color: lightgray;
}

.thread-name {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.topic-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.topic-name {
  overflow: hidden;
  white-space: nowrap;
}

.topic-menu {
  margin-left: 1em;
  color: darkgray;
  font-size: .9rem;
}
</style>

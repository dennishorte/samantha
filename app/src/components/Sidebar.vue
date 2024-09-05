<template>
  <div class="sidebar">
    <div v-for="thread in threads" class="thread-name">
      <div @click="show(thread._id)">{{ threadName(thread) }}</div>
      <div
        v-if="thread.closed && !thread.processed"
        class="badge text-bg-warning"
        @click="process(thread._id)"
      >*</div>
    </div>

    <hr />

    <div v-for="topic in topics" class="topic-name">
      {{ topicName(topic) }}
    </div>
  </div>
</template>


<script>
export default {
  name: 'Sidebar',

  props: {
    threads: Array,
    topics: Array,
  },

  methods: {
    process(threadId) {
      this.$emit('process-thread', { threadId })
    },

    show(threadId) {
      this.$emit('show-thread', { threadId })
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

.topic-name {
  overflow: hidden;
  white-space: nowrap;
}
</style>

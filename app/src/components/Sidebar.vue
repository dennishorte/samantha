<template>
  <div class="sidebar">
    <div v-for="thread in threads" class="thread-name" @click="show(thread._id)">
      {{ threadName(thread) }}
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
</style>

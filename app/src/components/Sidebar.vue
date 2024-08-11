<template>
  <div class="sidebar">
    <div v-for="thread in threads" class="thread-name">
      {{ threadName(thread) }}
    </div>
  </div>
</template>


<script>
export default {
  name: 'Sidebar',

  props: {
    threads: Array,
  },

  methods: {
    threadName(thread) {
      if (thread.messages.length === 0) {
        return 'new thread'
      }
      else {
        return thread.messages[0].content.substring(0, 10)
      }
    },
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

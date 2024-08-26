<template>
  <div class="sidebar">
    <div v-for="thread in threads" class="thread-name" @click="show(thread._id)">
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
    show(threadId) {
      this.$emit('show-thread', { threadId })
    },

    threadName(thread) {
      return thread.name
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

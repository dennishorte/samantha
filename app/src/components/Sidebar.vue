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

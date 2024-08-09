<template>
  <div class="chat-history">
    <template v-if="messages.length === 0">
      new chat
    </template>

    <template v-else>
      <div v-for="m in messages">
        {{ m }}
      </div>
    </template>
  </div>
</template>


<script>
export default {
  name: 'ChatHistory',

  props: {
    messages: Array,
  },
}
</script>


<style scoped>
</style>

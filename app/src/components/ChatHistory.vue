<template>
  <div class="chat-history">
    <template v-if="messages.length === 0">
      new chat
    </template>

    <template v-else>
      <div v-for="m in messages" :class="`${m.role}-outer`" class="message">
        <div>
          {{ m.content }}
        </div>
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
.chat-history {
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 1rem;
  white-space: pre-wrap;
  border-radius: 1rem;
}

.assistant-outer {
  max-width: 70%;
  background-color: #ddd;
}

.user-outer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 70%;
  background-color: #eee;
}
</style>

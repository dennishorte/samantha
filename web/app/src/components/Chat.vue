<template>
  <div class="chat">
    <ChatHistory class="max-size" />
    <ChatInput class="min-size" />
  </div>
</template>


<script>
import ChatHistory from './ChatHistory'
import ChatInput from './ChatInput'

export default {
  name: 'Chat',

  components: {
    ChatHistory,
    ChatInput,
  },
}
</script>


<style scoped>
.chat {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1em;
}

.max-size {
  flex-grow: 1;
}

.min-size {
  flex-grow: 0;
}
</style>

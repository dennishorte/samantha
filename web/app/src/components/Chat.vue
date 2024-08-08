<template>
  <div class="chat">
    <ChatHistory class="max-size" />
    <ChatInput class="min-size" @message-input="sendMessage" />
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

  inject: ['user'],

  methods: {
    async sendMessage(text) {
      const response = await this.$post('/api/message', {
        userId: this.user._id,
        threadId: null,
        message: text,
      })

      console.log(response)
    },
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

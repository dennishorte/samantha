<template>
  <div class="chat-history" ref="chathistory">
    <div v-for="m in messages" :class="m.role" class="message">
      <div>
        {{ m.content }}
      </div>
    </div>

    <div v-if="waitingForResponse" class="d-flex justify-content-center">
      <div class="spinner-border text-primary">
        &nbsp;
      </div>
    </div>

  </div>
</template>


<script>
export default {
  name: 'ChatHistory',

  props: {
    messages: Array,
    waitingForResponse: Boolean,
  },

  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const elem = this.$refs.chathistory
        const last = elem.lastElementChild
        last.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    },
  },

  watch: {
    messages: {
      handler() { this.scrollToBottom() },
      flush: 'post',
      deep: true,
    },
  },
}
</script>


<style scoped>
.chat-history {
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 2rem;
}

.message {
  padding: 1rem;
  white-space: pre-wrap;
  border-radius: 1rem;
}

.assistant {
  max-width: 70%;
  background-color: #ddd;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 70%;
  background-color: #eee;
}
</style>

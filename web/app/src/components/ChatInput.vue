<template>
  <div class="chat-input">
    <textarea
      class="form-control"
      v-model="text"
      @keyup.enter="sendMessage"
      placeholder="message"
      rows="1"
    />
  </div>
</template>


<script>
export default {
  name: 'ChatInput',

  inject: ['user'],

  data() {
    return {
      text: '',
    }
  },

  methods: {
    sendMessage() {
      this.$emit('message-input', this.text)
      this.text = ''
    },
  },
}
</script>


<style scoped>
input {
  width: 100%;
}
</style>

<template>
  <div class="chat-input">
    <textarea
      class="form-control"
      v-model="text"
      @keyup.enter.exact.prevent="sendMessage"
      @keyup.enter.shift.exact.prevent="addNewline"
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
    addNewline() {
      this.text += '\n'
    },

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

<template>
  <div class="chat-input">
    <textarea class="form-control" v-model="text" placeholder="message" rows="1" />
  </div>
</template>


<script>
export default {
  name: 'ChatInput',

  data() {
    return {
      text: '',
    }
  },
}
</script>


<style scoped>
input {
  width: 100%;
}
</style>

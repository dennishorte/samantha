<template>
  <div class="home">
    Hello, world!

    <div>
      {{ json }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      json: {},
    }
  },

  async mounted() {
    this.json = await this.$post('/api/test', {})
  },
}
</script>


<style scoped>
</style>

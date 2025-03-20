
<template>
  <div class="d-flex align-center text-high-emphasis gap-2">
    <VIcon
      size="24"
      :icon="icon"
    />
    <div
      class="field  d-flex align-center gap-1"
      :class="{'link-style': hasLink}"
      @click="emits('onClickLink')"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
  hasLink: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['onClickLink'])
</script>

<style lang="scss" scoped>
.field{
  font-size: 15px;
  font-weight: 600;
}
</style>

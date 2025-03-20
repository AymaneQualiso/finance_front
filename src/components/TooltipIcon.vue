<template>
  <VTooltip :text="tooltipText">
    <template #activator="{ props: tooltipProps }">
      <span :class="{'is-not-allowed': isNotAllowed}">
        <VIcon
          v-bind="tooltipProps"
          :icon="icon"
          :color="[isNotAllowed ? 'default' : color]"
          :size="size"
          :class="{'is-disabled': isNotAllowed}"
          @click="handleClick"
        />
      </span>
    </template>
  </VTooltip>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
  },
  tooltipText: {
    type: String,
  },
  size: {
    type: String,
    default: "26",
  },
  color: {
    type: String,
    default: "primary",
  },
  isNotAllowed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

function handleClick() {
  emit("click")
}
</script>

<style scoped>
.is-disabled{
  opacity: 0.3;
  pointer-events: none;
}

.is-not-allowed{
  cursor: not-allowed !important;
}
</style>

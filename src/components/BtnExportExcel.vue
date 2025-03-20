<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        color="primary"
        class="ms-4"
        :disabled="isLoading"
        v-bind="props"
      >
        {{ $t('ImportMd.Export') }}
        <VProgressCircular
          v-if="isLoading"
          indeterminate
          color="secondary"
          :size="20"
          width="3"
          class="ml-2"
        />
      </VBtn>
    </template>
    <VList>
      <VListItem>
        <VListItemTitle
          class="cursor-pointer"
          @click="exportPlanInvent('csv')"
        >
          CSV
        </VListItemTitle>
      </VListItem>
      <VListItem>
        <VListItemTitle
          class="cursor-pointer"
          @click="exportPlanInvent('xlsx')"
        >
          XLSX
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['export'])

function exportPlanInvent(format){
  emits('export', format)
}
</script>

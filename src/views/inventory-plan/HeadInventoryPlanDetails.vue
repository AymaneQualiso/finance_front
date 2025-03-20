<template>
  <VCard
    class="mb-6" 
    :loading="isLoading"
  >
    <template #title>
      <div
        v-if="!isLoading && inventoryPlan"
        class="d-flex align-center gap-2"
      >
        <h3 class="text-truncate">
          {{ inventoryPlan.name }}
        </h3>
        <StatusChip
          v-if="inventoryPlan.status"
          :title="inventoryPlan.status"
          class="ms-2"
        />
      </div>
    </template>
    <template #text>
      <div
        v-if="! isLoading && inventoryPlan"
        class="d-flex align-center text-high-emphasis gap-8"
      >
        <HeaderField icon="tabler-circle-key-filled">
          {{ inventoryPlan.reference }}
        </HeaderField>
        <HeaderField icon="tabler-calendar-month">
          {{ formatDate(inventoryPlan.start_at) }} {{ $t('To') }} {{ formatDate(inventoryPlan.end_at) }}
        </HeaderField>
        <HeaderField icon="tabler-user">
          {{ inventoryPlan.user_group_name }}
        </HeaderField>
        <HeaderField icon="tabler-rubber-stamp">
          {{ inventoryPlan.nature_name }}
        </HeaderField>
      </div>
    </template>
    <template
      v-if="!isLoading && inventoryPlan"
      #actions
    >
      <div class="w-100 d-flex align-center justify-end gap-2">
        <BtnAttachments 
          :model-able="modelAble"
          model="inventory_plans"
          @on-upload-file="uploadAttachment"
          @on-delete="deleteAttachment"
          @on-download-file="downloadAttachment"
        />
        <VBtn
          v-if="$can('inventory_plans.update') && inventoryPlan?.status !== enums?.inventoryStatus.CLOSED && inventoryPlan.can_edit"
          color="primary"
          variant="tonal"
          class="me-3"
          @click="redirectToForm(inventoryPlan, 'edit', {src: $route.path})"
        >
          <VIcon
            size="24"
            icon="tabler-edit"
            class="cursor-pointer"
          />
        </VBtn>
        <VBtn
          v-if=" $can('direct_permissions.reopen_inventory') && inventoryPlan?.status == enums?.inventoryStatus.CLOSED"
          :loading="isReopening"
          :disabled="isReopening"
          color="info"
          variant="tonal"
          @click="onReopen(inventoryPlan?.id)"
        >
          {{ $t('reopen') }}
          <VIcon
            size="24"
            icon="tabler-lock-open-off"
            class="ms-2"
          />
        </VBtn>
      </div>     
    </template>
  </VCard>
</template>

<script setup>
import BtnAttachments from '@/components/BtnAttachments.vue'
import { useInventoryPlan } from "@/composables/inventoryPlan"

const props = defineProps({
  inventoryPlan: {
    type: Object,
    required: true,
  },
})

const t = inject('t')
const showSnackbar = inject('showSnackbar')

const { 
  modelAble,
  isLoading,
  redirectToForm, 
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  enums,
  onReopen,
  isReopening,
} = useInventoryPlan(t, showSnackbar)

watch(
  () => props.inventoryPlan,
  () => { 
    modelAble.value.id = props.inventoryPlan.id
  }, 
  { deep: true, immediate: true },
)
</script>

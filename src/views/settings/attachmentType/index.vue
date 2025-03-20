<template>
  <ConfirmDeleteDialog 
    :is-dialog-visible="isDeleteDialogVisible" 
    @close="isDeleteDialogVisible = !isDeleteDialogVisible" 
    @on-delete="deleteItem"
  />

  <VDialog
    v-model="isDialogVisible"
    max-width="600"
  >
    <DialogCloseBtn @click="closeModal" :disabled="isLoading" />
    <VCard :title="$t('Attachment Type.Title')">
      <VCardText>
        <VForm ref="itemForm">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="form.name"
                :label="$t('Name')"
                :placeholder="$t('Name')"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model.trim="form.label"
                counter="5"
                :label="$t('Attachment Type.Label')"
                :placeholder="$t('Attachment Type.Label')"
                :rules="[requiredValidator, maxLengthValidator(form.label, 5)]"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          @click="closeModal"
          :disabled="isLoading"
        >
          {{ $t('Cancel') }}
        </VBtn>
        <VBtn @click="addItem" :loading="isLoading" :disabled="isLoading">
          {{ $t('Confirm') }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>

  <VCard :title="$t('Attachment Type.Title')">
    <template #append>
      <VBtn
        v-if="$can('attachment_types.store')"
        color="primary"
        @click="openModal('add')"
      >
        {{ $t('Add') }}
      </VBtn>
    </template>
    <DataTableCore
      :headers="headers"
      :items="records"
      :total="total"
      :per_page="10"
      :is-loading="isLoading"
      :filter="filter"
      @change-filter="changeFilter"
    >
      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-3">
          <TooltipIcon
            v-if="$can('attachment_types.update')"
            :tooltip-text="$t('edit')"
            icon="tabler-edit"
            color="primary"
            @click="openModal('update', item)"
          />
          <TooltipIcon
            v-if="$can('attachment_types.destroy')"
            :tooltip-text="$t('delete')"
            icon="tabler-trash"
            color="error"
            @click="openConfirmationModal(item)"
          />
        </div>
      </template>
    </DataTableCore>
  </VCard>
</template>

<script setup>
import { useAttachmentTypeStore } from "@/stores"
import { cloneDeep } from 'lodash'

const attachmentTypeStore =  useAttachmentTypeStore()
const { records, isLoading, total, filter } = storeToRefs(attachmentTypeStore)
const t = inject('t')
const showSnackbar = inject("showSnackbar")

const headers = ref([
  {
    title: t('Name'),
    sortable: true,
    key: "name",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t('Attachment Type.Label'),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: "Date",
    sortable: true,
    key: "created_at",
    filtervalue: [],
    filterable: true,
    typefilter: "date",
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
])

const isDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const action = ref("")
const rememberId = ref(null)
const form = ref({})
const itemForm = ref(null)

onMounted(() => {
  attachmentTypeStore.getRecords()
})

watch(() => form.value.name,
  () => {

  })

function changeFilter(...obj) {
  attachmentTypeStore.getRecords(...obj)
}

function openModal(actionName, item = {}) {
  form.value = item ? cloneDeep(item) : {}
  action.value = actionName
  rememberId.value = item ? item.id : null
  isDialogVisible.value = true
}

function openConfirmationModal(item) {
  rememberId.value = item.id
  isDeleteDialogVisible.value = true
}

async function deleteItem() {
  const res = await attachmentTypeStore.deleteRecord({
    id: rememberId.value,
  })

  if (res) {
    showSnackbar(t('Deleted ok'))
    rememberId.value = null
    isDeleteDialogVisible.value = false
  }
}

function closeModal() {
  action.value = ""
  rememberId.value = null
  isDialogVisible.value = false
  itemForm.value?.reset()
}

function addItem() {
  itemForm.value.validate().then(async ({ valid }) => {
    if (!valid) return
    if (action.value === "add") {
      const res = await attachmentTypeStore.addRecord(form.value)
      if (res) {
        closeModal()
        showSnackbar(t('Added ok'))
      }
    } else if (action.value === "update") {
      form.value.id = rememberId.value

      const res = await attachmentTypeStore.updateRecord(form.value)
      if (res) {
        closeModal()
        showSnackbar(t('Updated ok'))
      }
    }
  })
}
</script>

<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

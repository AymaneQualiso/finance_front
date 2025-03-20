<template>
  <VDialog v-model="localDialogVisible" max-width="600">
    <DialogCloseBtn @click="closeModal" />
    <VCard :title="$t('Edit User Information')">
      <VCardText>
        <VForm ref="itemForm" @submit.prevent>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model.trim="localUserData.name"
                :label="$t('Name')"
                placeholder="Nom"
                class="required"
                :rules="[requiredValidator, minLengthValidator(localUserData.nom, 3)]"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model.trim="localUserData.phone"
                :label="$t('Phone')"
                placeholder="Phone"
                class="required"
                :rules="[requiredValidator, minLengthValidator(localUserData.phone, 3)]"
              />
            </VCol>
            <VCol cols="12">
              <VFileInput
                v-model="localUserData.avatar"
                accept="image/*"
                label="Avatar"
                prepend-icon="tabler-camera"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn @click="onFormSubmit">
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'submit',
  'update:isDialogVisible',
])

const localDialogVisible = ref(props.isDialogVisible);
// const localUserData = ref({ ...props.userData });
const localUserData = ref({});
const itemForm = ref()

watch(() => props.isDialogVisible, (newValue) => {
  localDialogVisible.value = newValue;
  if (newValue === true) {
    // localUserData.value = { ...props.userData, avatar: Array.isArray(props.userData.avatar) ? props.userData.avatar : null }
    localUserData.value = {
      id: props.userData.id,
      name: props.userData.name,
      // prenom: props.userData.prenom,
      phone: props.userData.phone,
      avatar: Array.isArray(props.userData.avatar) ? props.userData.avatar : null
    }
  }
})

watch(localDialogVisible, (newValue) => {
  emit('update:isDialogVisible', newValue);
})

const onFormSubmit = () => {
  itemForm.value.validate().then(async ({ valid }) => {
    if (!valid) return

    emit('submit', localUserData.value)
    closeModal()
  })
}

const closeModal = () => {
  emit('update:isDialogVisible', false)
  localUserData.value = {}
}
</script>

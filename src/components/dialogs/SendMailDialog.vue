<template>
  <VDialog
    v-model="isSendMailDialogShown"
    max-width="600"
    persistent
  >
    <DialogCloseBtn @click="closeSendMailModal" :disabled="loadingSendingEmail" />
    <VCard :title="$t('SendMail')">
      <VCardText>
        <VForm ref="sendForm">
          <VRow>
            <VCol cols="12">
              <VCombobox
                v-model="mails.to"
                :items="users"
                item-title="name"
                item-value="email"
                :label="$t('To')"
                :placeholder="$t('Send mail.Choice mails')"
                :hint="$t('invoices.send-mail-hint')"
                :rules="[requiredValidator, emailValidator]"
                multiple
                chips
                closable-chips
                :return-object="false"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VCombobox
                v-model="mails.cc"
                :items="users"
                item-title="name"
                item-value="email"
                :label="$t('cc')"
                :placeholder="$t('cc')"
                :rules="[emailValidator]"
                multiple
                chips
                closable-chips
                :return-object="false"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" v-if="isSendMailWithBody">
              <v-textarea
                v-model="mails.body"
                :label="$t('mail_content')"
                :rules="[requiredValidator]"
                row-height="25"
                rows="4"
                variant="outlined"
                auto-grow
                shaped
              ></v-textarea>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="loadingSendingEmail"
          @click="closeSendMailModal"
        >
          {{ $t("Cancel") }}
        </VBtn>
        <VBtn
          :loading="loadingSendingEmail"
          :disabled="loadingSendingEmail"
          @click="sendingMail"
        >
          {{ $t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { useUserStore } from "@/stores"

const usersStore = useUserStore()
const mails = ref({})
const sendForm = ref()
const t = inject("t")
const showSnackbar = inject("showSnackbar")
const { users } = storeToRefs(usersStore)

const emit = defineEmits(['sendEmail',"update:send-mail-dialog-shown"]);
const isSendMailDialogShown = defineModel("sendMailDialogShown", {
  type: Boolean,
  default: false,
});
const isSendMailWithBody = defineModel("sendMailWithBody", {
  type: Boolean,
  default: false,
});
const loadingSendingEmail = defineModel("isLoadingSendingEmail", {
  type: Boolean,
  default: false,
});
const labelBalance = defineModel("label", {
  type: String,
  default: '',
});

watch(
  () => isSendMailDialogShown.value,
  (newVal) => {
    if (newVal) {
      mails.value.to = []
      mails.value.cc = []
      if(isSendMailWithBody.value) mails.value.body = `Bonjour, 

nous avons le plaisir de partager avec vous en pièce jointe détails de la balance : ${labelBalance.value}.

Bien cordialement.`;
    }
  }
);

function closeSendMailModal() {
  emit("update:send-mail-dialog-shown", false);
  mails.value.to = []
  mails.value.cc = []
  if(isSendMailWithBody.value) mails.value.body = `Bonjour, 

nous avons le plaisir de partager avec vous en pièce jointe détails de la balance : ${labelBalance.value}.

Bien cordialement.`;
}

function sendingMail(){
  sendForm.value.validate().then(async ({ valid }) => {
    if (!valid) return

    emit('sendEmail', mails)
  })
}

onMounted(() => {
  if(isEmpty(users.value)) usersStore.getDTUsers()
  mails.value = {}
  mails.value.to = []
  mails.value.cc = []
  if(isSendMailWithBody.value) mails.value.body = `Bonjour,

nous avons le plaisir de partager avec vous en pièce jointe détails de la balance : ${labelBalance.value}.

Bien cordialement.`;

})
</script>

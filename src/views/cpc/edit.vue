<template>
  <SendMailDialog
    v-model:is-loading-sending-email="isLoadingSendingEmail"
    v-model:send-mail-dialog-shown="isSendMailDialogOpen"
    @update:send-mail-dialog-shown="isSendMailDialogOpen = $event"
    @send-email="handleMailSending"
  />
  <ConfirmDialogDoubleChoice
    nameFirstChoice="calculCpc"
    nameSecondChoice="calculAll"
    confirmation-question="Select type calcul"
    :is-dialog-visible="isConfirmChoiceDialogVisible"
    :loading="isCalculating"
    :hide-on-confirmation="true"
    @update:is-dialog-visible="isConfirmChoiceDialogVisible = $event"
    @confirm="handleCpcCalculation"
    @confirmSecond="handleAllCpcCalculation"
    @cancel="closeDisplayDoubleChoiceCalcul"
  />
  <!-- <VDialog v-model="isSendMailDialogOpen" persistent max-width="600">

    <DialogCloseBtn :disabled="isSendingMail" @click="closeModal" />

    <VCard
      :title="$t('Envoyer CPC par Email')"
      :loading="isSendingMail"
      :disabled="isSendingMail"
    >
      <VCardText>
        <VForm ref="form">
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="mailForm.users"
                :label="$t('À')"
                :placeholder="$t('À')"
                :items="users"
                item-title="name"
                item-value="email"
                :rules="[
                  requiredValidator,
                  allSelectChipsShouldBeEmailValidator,
                ]"
                class="mt-2 required"
                :return-object="false"
                :readonly="action === 'show'"
                multiple
                chips
                closable-chips
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ t("Cancel") }}
        </VBtn>
        <VBtn @click="handleMailSending" v-if="action !== 'show'">
          {{ t("Confirm") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog> -->
  <VCard v-if="$can('cpc.update')">
    <template #title>
      <div class="d-md-flex justify-space-between align-center w-100">
        <div class="d-flex align-center flex-wrap">
          <span class="me-2">{{
            $t("Compte de Produits et Charges (Hors Taxes)")
          }}</span>
          <VChip
            v-if="currentCpc.status"
            :color="getStatusColor(currentCpc.status)"
            :text-color="
              currentCpc.status === 'validee' ? 'error' : 'red darken-2'
            "
            style="font-size: 18px; margin-left: 5em"
          >
            {{ currentCpc.status }}
          </VChip>
        </div>
      </div>
    </template>
    <template #append>
      <span v-tooltip="$t('send-mail-cpc')">
        <VBtn
          color="secondary"
          variant="tonal"
          class="me-2"
          @click="redirectToList()"
        >
          <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
        </VBtn>
        <VBtn
          color="primary"
          @click="openMailModal()"
          v-if="$can('cpc.update')"
          class="me-2"
        >
          <VIcon icon="tabler-mail" size="28" />
          <!-- {{ $t("send-mail") }} -->
        </VBtn>
      </span>

      <VBtn
        variant="tonal"
        class="me-2"
        color="primary"
        @click="handleExport()"
        v-if="$can('cpc.export')"
      >
        <VIcon v-if="!isExportingCpcs" class="tabler-file-x" size="20"></VIcon>
        &nbsp;

        <span v-if="!isExportingCpcs">{{ $t("export") }}</span>
        <VProgressCircular
          v-else
          indeterminate
          color="primary"
          size="24"
        ></VProgressCircular>
      </VBtn>

      <VBtn
        class="me-2"
        color="primary"
        @click="handleDisplayDoubleChoiceCalcul()"
        v-if="
          $can('cpc.calculate') &&
          currentCpc.status !== 'Clôturé' &&
          currentCpc.status != 'Validé'
        "
      >
        <VIcon
          v-if="!isCalculating"
          class="tabler-calculator"
          size="20"
        ></VIcon>
        &nbsp;
        <span v-if="!isCalculating">{{ $t("calculate") }}</span>
        <VProgressCircular
          v-else
          indeterminate
          color="primary"
          size="24"
        ></VProgressCircular>
      </VBtn>
      <VBtn
        variant="tonal"
        class="me-2"
        color="success"
        @click="openValidationDialog"
        v-if="
          $can('cpc.valide') &&
          currentCpc.status !== 'Validé' &&
          currentCpc.status !== 'Clôturé'
        "
      >
        <VIcon v-if="!isValidateCpcs" class="tabler-checkbox" size="20"></VIcon>
        &nbsp;
        <span v-if="!isValidateCpcs">{{ $t("Valider") }}</span>
        <VProgressCircular
          v-else
          indeterminate
          color="success"
          size="24"
        ></VProgressCircular>
      </VBtn>
      <VDialog v-model="isValidationDialogOpen" max-width="500">
        <VCard>
          <VCardTitle>{{ $t("Confirmation de Validation") }}</VCardTitle>
          <VCardText>
            {{ $t("Êtes-vous sûr de vouloir valider ce CPC ?") }}
          </VCardText>
          <VCardText class="d-flex justify-end flex-wrap gap-3">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="closeValidationDialog"
              :disabled="isValidateCpcs"
            >
              {{ $t("Cancel") }}
            </VBtn>
            <VBtn
              :disabled="isValidateCpcs"
              color="primary"
              @click="confirmValidation"
            > 
              {{ $t("Confirm") }}
              <VProgressCircular
                v-if="isValidateCpcs"
                indeterminate
                color="primary"
                size="24"
              />
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
    </template>
    <VTable v-if="!isCalculating">
      <tbody>
        <tr>
          <td class="text-center p-0 font-weight-bold" colspan="2">
            <span>{{ $t("CPC") }} :</span>
            <span class="text-primary mx-4">{{ currentCpc.label }}</span> |
            <span class="ml-4">{{ $t("BG") }} :</span>
            <span class="text-primary mx-4">{{
              currentCpc.balance_sheet_label
            }}</span>
            |
            <span v-if="!currentCpc.flag_bg_consolide" class="ml-4">{{ $t("Sté") }} :</span>
            <span v-if="!currentCpc.flag_bg_consolide" class="text-primary mx-4">{{ currentCpc.company }}</span> {{ currentCpc.flag_bg_consolide ? '' : '|' }}
            <span class="ml-4">{{ $t("PC") }} :</span>
            <span class="text-primary mx-4">{{
              currentCpc.chart_account
            }}</span>
          </td>
        </tr>
        <hr />
        <tr v-for="(items, section) in cpcDetails" :key="section" class="pt-5">
          <!-- <td class="text-5xl text-center bb" :class="section == 'I' ? '' : ''">{{ section }} </td> -->

          <VTable>
            <thead>
              <tr v-if="section == 'I'" class="">
                <th
                  class="text-center border-v-table font-weight-bold"
                  rowspan="2"
                >
                  {{ $t("designation") }}
                </th>
                <th class="text-center border-v-table font-weight-bold">
                  {{ $t("Propres à l'exercice") }}<br />
                </th>
                <th class="text-center border-v-table font-weight-bold">
                  {{ $t("Concernant les exercices précédents") }}<br />
                </th>
                <th class="text-center border-v-table font-weight-bold">
                  {{ $t("TOTAUX DE L'EXERCICE") }}<br />
                </th>
                <th class="text-center border-v-table font-weight-bold">
                  {{ $t("TOTAUX DE L'EXERCICE PRECEDENT") }}<br />
                </th>
              </tr>
              <tr v-if="section == 'I'">
                <th class="text-center border-v-table font-weight-bold">1</th>
                <th class="text-center border-v-table font-weight-bold">2</th>
                <th class="text-center border-v-table font-weight-bold">
                  3 = 2 + 1
                </th>
                <th class="text-center border-v-table font-weight-bold">4</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td
                  style="width: 30%"
                  class="border-v-table"
                  :class="
                    item.cpc_model.type_calcul == 'total'
                      ? 'font-weight-bold text-primary'
                      : ''
                  "
                >
                  {{ item.label }}
                </td>
                <td
                  class="border-v-table text-end"
                  :class="
                    item.cpc_model.type_calcul == 'total'
                      ? 'font-weight-bold text-primary'
                      : ''
                  "
                  style="width: 15%"
                >
                  {{ item.total1 ?? Number(0).toFixed(2) }}
                </td>
                <td
                  class="border-v-table text-end"
                  :class="
                    item.cpc_model.type_calcul == 'total'
                      ? 'font-weight-bold text-primary'
                      : ''
                  "
                  style="width: 15%"
                >
                  {{ item.total2 ?? Number(0).toFixed(2) }}
                </td>
                <td
                  class="border-v-table text-end"
                  :class="
                    item.cpc_model.type_calcul == 'total'
                      ? 'font-weight-bold text-primary'
                      : ''
                  "
                  style="width: 15%"
                >
                  {{ item.total3 ?? Number(0).toFixed(2) }}
                </td>
                <td
                  class="border-v-table text-end"
                  :class="
                    item.cpc_model.type_calcul == 'total'
                      ? 'font-weight-bold text-primary'
                      : ''
                  "
                  style="width: 15%; padding: 15px"
                >
                  <VTextField
                    class="textField"
                    v-model="item.total4"
                    :readonly="
                      currentCpc.status == 'Validé' ||
                      currentCpc.status == 'Clôturé'
                    "
                    :placeholder="t('new-total-previous')"
                    type="number"
                    min="0"
                    @change="updateTotal4ForCpcItem(item, hide)"
                    v-if="item.cpc_model?.type_calcul == 'compte'"
                  >
                    <!--  -->
                    <template v-slot:prepend-inner>
                      <VProgressCircular
                        v-if="
                          isTotal4Loading && item.total4 == isTotal4LoadingValue
                        "
                        indeterminate
                        color="primary"
                        size="20"
                      ></VProgressCircular>
                      <VIcon
                        slot="activator"
                        v-if="
                          item.updated_by !== null &&
                          item.total4 != isTotal4LoadingValue
                        "
                        color="warning"
                        icon="tabler-alert-triangle"
                        size="16"
                        class="ms-2"
                        v-tooltip="
                          `${t('changed-by')} ${item.updated_by.name} ${t(
                            'at'
                          )} ${new Date(item.updated_at).toLocaleString(
                            'fr-FR'
                          )}`
                        "
                      />
                    </template>
                  </VTextField>

                  <!-- <VDropdown
                    :showTriggers="(triggers) => [...triggers, 'click']"
                    v-if="item.cpc_model?.type_calcul == 'compte'"
                    compute-transform-origin
                    placement="top"
                    @hide="handleHide(item)"
                  >
                    <button style="text-decoration: underline">
                      {{ item.total4 ?? Number(0).toFixed(2) }}

                      <VIcon
                        v-if="item.updated_by !== null"
                        color="warning"
                        icon="tabler-alert-triangle"
                        size="16"
                        class="ms-2"
                        v-tooltip="
                          `${t('changed-by')} ${item.updated_by.name} ${t(
                            'at'
                          )} ${new Date(item.updated_at).toLocaleString(
                            'fr-FR'
                          )}`
                        "
                      />
                    </button>

                    <template #popper="{ hide }">
                      <div style="padding: 15px; width: 15rem">
                        <div>
                          <VTextField
                            v-model="item.total4"
                            :label="t('new-total-previous')"
                            :placeholder="t('new-total-previous')"
                            type="number"
                            min="0"
                            :hint="$t('hit-enter-to-save')"
                            @keydown.enter="updateTotal4ForCpcItem(item, hide)"
                            :loading="isTotal4Loading"
                            :disabled="isTotal4Loading"
                          />
                        </div>
                      </div>
                    </template>
                  </VDropdown> -->

                  <span v-else>
                    {{ item.total4 ?? Number(0).toFixed(2) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </VTable>
        </tr>
      </tbody>
    </VTable>

    <div
      v-else
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding-bottom: 50px;
      "
    >
      <VProgressCircular
        indeterminate
        color="primary"
        size="100"
      ></VProgressCircular>
    </div>
  </VCard>
</template>

<script setup>
import { useCpc } from "@/composables/cpc";
import { ref } from "vue";
import { useRoute } from "vue-router";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const route = useRoute();
const router = useRouter();
const form = ref();
const isValidationDialogOpen = ref(false);

const isValidateCpcs = ref(false);
const openValidationDialog = () => {
  isValidationDialogOpen.value = true;
};

const closeValidationDialog = () => {
  isValidationDialogOpen.value = false;
};

const {
  getCpc,
  currentCpc,
  cpcDetails,
  isCalculating,
  calculateCpc,
  isExportingCpcs,
  handleCpcExport,
  updateTotal4ForCpc,
  openMailModal,
  isSendMailDialogOpen,
  isSendingMail,
  mailForm,
  handleMailSending: handleMailSendingComposable,
  getEmailsUsers,
  cpcStore,
  users,
  closeModal,
  isLoadingSendingEmail,
  isConfirmChoiceDialogVisible,
  closeDisplayDoubleChoiceCalcul,
  handleDisplayDoubleChoiceCalcul,
} = useCpc(t, showSnackbar);

const isTotal4Loading = ref(false);
const isTotal4LoadingValue = ref(null);

const handleExport = async () => {
  await handleCpcExport(route.params.id);
};

// const handleMailSending = async () => {
//   form.value.validate().then(async ({ valid }) => {
//     if (!valid) return;
//     const isSuccess = await handleMailSendingComposable(route.params.id);
//     console.log(isSuccess)
//     if (isSuccess) {
//       showSnackbar(t("mail-sent-successfully"), {
//         color: "success",
//       });
//     } else {
//       showSnackbar(t("error-occured"), {
//         color: "error",
//       });
//     }

//     closeModal();
//   });
// };

const confirmValidation = async () => {
  isValidateCpcs.value = true;
  try {
    const isSuccess = await cpcStore.valideCpc(route.params.id);
    console.log("succ", isSuccess);

    if (isSuccess.success) {
      showSnackbar(t("CPC validé avec succès !"), { color: "success" });
      await getCpc(route.params.id);
    }
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
    showSnackbar(t("Une erreur inattendue s'est produite."), {
      color: "error",
    });
  } finally {
    isValidateCpcs.value = false;
    closeValidationDialog();
  }
};

async function handleMailSending(emails) {
  const isSuccess = await handleMailSendingComposable(route.params.id, emails);

  if (isSuccess) {
    showSnackbar(t("mail-sent-successfully"), {
      color: "success",
    });
    closeModal();
  } else {
    showSnackbar(t("error-occured"), {
      color: "error",
    });
  }
}

const updateTotal4ForCpcItem = async (item, hide) => {
  isTotal4Loading.value = true;
  isTotal4LoadingValue.value = item.total4;
  if (!item.total4) {
    item.total4 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal4ForCpc(item);
  if (isSuccessfull) {
    await getCpc(route.params.id);
    // hide();
    showSnackbar(t("updated-successfully-for", { model: item.label }), {
      color: "success",
    });
  } else {
    showSnackbar(t("error-occured"), {
      color: "error",
    });
  }
  isTotal4Loading.value = false;
  isTotal4LoadingValue.value = null;
};

const handleHide = (item) => {
  if (!item.total4) {
    item.total4 = Number(0).toFixed(2);
  }
};
const getStatusColor = (status) => {
  switch (status) {
    case "Brouillon":
      return "grey";
    case "Validé":
      return "success";
    case "Clôturé":
      return "error";
    default:
      return "primary";
  }
};
const handleCpcCalculation = async () => {
  await calculateCpc(route.params.id, false);
};
const handleAllCpcCalculation = async () => {
  await calculateCpc(route.params.id, true);
};
const redirectToList = async () => {
  router.push({ name: "cpc-list" });
};
onMounted(async () => {
  await getCpc(route.params.id);
  await getEmailsUsers();
});
</script>
<style scoped>
.textField >>> input {
  text-align: end !important;
}
.v-table--density-default > .v-table__wrapper > table > tbody > tr > th,
.v-table--density-default > .v-table__wrapper > table > thead > tr > th,
.v-table--density-default > .v-table__wrapper > table > tfoot > tr > th {
  height: 0px;
}
.border-v-table {
  border-bottom: 1px solid rgb(211, 212, 220);
  border-left: 1px solid rgb(211, 212, 220);
}
.v-table th {
  color: rgb(var(--v-theme-primary)) !important;
}
.bt {
  border-top: 1px solid rgb(211, 212, 220);
}
.bb {
  border-bottom: 1px solid rgb(211, 212, 220);
}
</style>

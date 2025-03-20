<template>
  <ConfirmDialogDoubleChoice
    nameFirstChoice="calculBilan"
    nameSecondChoice="calculAll"
    confirmation-question="Select type calcul"
    :is-dialog-visible="isConfirmChoiceDialogVisible"
    :loading="isCalculating"
    :hide-on-confirmation="true"
    @update:is-dialog-visible="isConfirmChoiceDialogVisible = $event"
    @confirm="handleBilanCalculation"
    @confirmSecond="handleAllBilanCalculation"
    @cancel="closeDisplayDoubleChoiceCalcul"
  />
  <VDialog v-model="isSendMailDialogOpen" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isSendingMail" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t('Envoyer Bilan par Email')"
      :loading="isSendingMail"
      :disabled="isSendingMail"
    >
      <VCardText>
        <VForm ref="form">
          <VRow>
            <VCol cols="12">
              <AppCombobox
                v-model="mailForm.to"
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
            <VCol cols="12">
              <AppCombobox
                v-model="mailForm.cc"
                :label="$t('cc')"
                :placeholder="$t('cc')"
                :items="users"
                item-title="name"
                item-value="email"
                :rules="[emailValidator]"
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
  </VDialog>
  <VCard :title="$t('Bilan')" v-if="$can('bilan.update')">
    <template #title>
      <div class="d-md-flex justify-space-between align-center w-100">
        <div class="d-flex align-center flex-wrap">
          <span class="me-2">{{
            $t("Compte de Produits et Charges (Hors Taxes)")
          }}</span>
          <VChip
            v-if="currentBilan.status"
            :color="getStatusColor(currentBilan.status)"
            :text-color="
              currentBilan.status === 'validee' ? 'error' : 'red darken-2'
            "
            style="font-size: 18px; margin-left: 5em"
          >
            {{ currentBilan.status }}
          </VChip>
        </div>
      </div>
    </template>
    <template #append>
      <VBtn
        color="secondary"
        variant="tonal"
        class="me-2"
        @click="redirectToList()"
      >
        <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
      </VBtn>

      <!-- <div class="v-btn me-4">
        <label for="actifSwitch" style="cursor: pointer">{{
          $t("Passif")
        }}</label>
        <VSwitch
          density="compact"
          id="actifSwitch"
          class="mx-2"
          v-model="isActif"
        />
        <label for="actifSwitch" style="cursor: pointer">{{
          $t("Actif")
        }}</label>
      </div>  -->
      <span v-tooltip="$t('send-mail-bilan')">
        <VBtn
          color="primary"
          @click="openMailModal()"
          v-if="$can('bilan.update')"
          class="me-2"
        >
          <VIcon icon="tabler-mail" size="28" />
        </VBtn>
      </span>

      <VBtn
        variant="tonal"
        class="me-2"
        color="primary"
        @click="handleExport()"
        v-if="$can('bilan.export')"
      >
        <VIcon
          v-if="!isExportingBilans"
          class="tabler-file-x"
          size="20"
        ></VIcon>
        &nbsp;

        <span v-if="!isExportingBilans">{{ $t("export") }}</span>
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
          $can('bilan.calculate') &&
          currentBilan.status !== 'Validé' &&
          currentBilan.status !== 'Clôturé'
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
          $can('bilan.valide') &&
          currentBilan.status !== 'Validé' &&
          currentBilan.status !== 'Clôturé'
        "
      >
        <VIcon
          v-if="!isExportingCpcs"
          class="tabler-checkbox"
          size="20"
        ></VIcon>
        &nbsp;
        <span v-if="!isExportingCpcs">{{ $t("Valider") }}</span>
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
            {{ $t("Êtes-vous sûr de vouloir valider ce Bilan ?") }}
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
              <VProgressCircular
                v-if="isValidateCpcs"
                indeterminate
                color="primary"
                size="24"
              />
              {{ $t("Confirm") }}
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
    </template>
    <div class="text-center p-0 font-weight-bold my-4">
      <span>{{ $t("BILAN") }} :</span>
      <span class="text-primary mx-4">{{ currentBilan.label }}</span> |
      <span class="ml-4">{{ $t("BG") }} :</span>
      <span class="text-primary mx-4">{{
        currentBilan.balance_sheet_label
      }}</span>
      |
      <span v-if="!currentBilan.flag_bg_consolide" class="ml-4">{{ $t("Sté") }} :</span>
      <span v-if="!currentBilan.flag_bg_consolide" class="text-primary mx-4">{{ currentBilan.company }}</span> {{ currentBilan.flag_bg_consolide ? '' : '|' }}
      <span class="ml-4">{{ $t("PC") }} :</span>
      <span class="text-primary mx-4">{{ currentBilan.chart_account }}</span>
    </div>

    <v-container class="d-flex justify-start" style="width: 100%; margin: 0">
      <v-tabs v-model="activeTab" bg-color="red-lighten-2" style="width: 100%">
        <v-tab :value="'actif'" class="rounded mx-1">{{ $t("Actif") }}</v-tab>
        <v-tab :value="'passif'" class="rounded mx-1">{{ $t("Passif") }}</v-tab>
      </v-tabs>
    </v-container>
    <div>
      <VTable v-if="activeTab === 'actif' && !isCalculating">
        <thead>
          <tr class="">
            <th class="text-center border-v-table font-weight-bold" rowspan="2">
              {{ $t("Actif") }}
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Brut") }}<br />
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Amortissements et provisions") }}<br />
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Net") }}<br />
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Exercice precedent net") }}<br />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bilanDetails" :key="item.id">
            <td
              style="width: 30%"
              class="border-v-table"
              :class="
                item.bilan_model.type_calcul == 'total' ||
                [410, 420].includes(item.bilan_model.id)
                  ? 'font-weight-bold text-primary'
                  : ''
              "
            >
              {{ item.label }}
            </td>
            <td
              class="border-v-table text-end"
              :class="
                item.bilan_model.type_calcul == 'total' ||
                [410, 420].includes(item.bilan_model.id)
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
                item.bilan_model.type_calcul == 'total' ||
                [410, 420].includes(item.bilan_model.id)
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
                item.bilan_model.type_calcul == 'total' ||
                [410, 420].includes(item.bilan_model.id)
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
                item.bilan_model.type_calcul == 'total'
                  ? 'font-weight-bold text-primary'
                  : ''
              "
              style="width: 15%; padding: 15px"
            >
              <VTextField
                class="textField"
                v-model="item.total4"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                @change="updateTotal4ForBilanItem(item, hide)"
                v-if="item.bilan_model?.type_calcul == 'compte'"
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
                      item.updated_at !== null &&
                      item.total4 != 0
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.updated_by.name} ${t(
                        'at'
                      )} ${new Date(item.updated_at).toLocaleString('fr-FR')}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                {{ item.total4 ?? Number(0).toFixed(2) }}
              </span>
            </td>
          </tr>
        </tbody>
      </VTable>

      <VTable v-else-if="activeTab === 'passif' && !isCalculating">
        <thead>
          <tr class="">
            <th class="text-center border-v-table font-weight-bold" rowspan="2">
              {{ $t("Passif") }}
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Exercice") }}<br />
            </th>
            <th class="text-center border-v-table font-weight-bold">
              {{ $t("Exercice precedent") }}<br />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bilanPassifDetails" :key="item.id">
            <td
              style="width: 30%"
              class="border-v-table"
              :class="
                item.bilan_passif_model.type_calcul == 'total' ||
                [360, 370].includes(item.bilan_passif_model.id)
                  ? 'font-weight-bold text-primary'
                  : ''
              "
            >
              {{ item.label }}
            </td>
            <td
              class="border-v-table text-end"
              :class="
                item.bilan_passif_model.type_calcul == 'total' ||
                [360, 370].includes(item.bilan_passif_model.id)
                  ? 'font-weight-bold text-primary'
                  : ''
              "
              style="width: 15%; padding: 15px"
            >
              <VTextField
                class="textField"
                v-model="item.total1"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                @change="updateTotal1ForBilanItem(item, hide)"
                v-if="
                  item.bilan_passif_model?.type_calcul == 'compte' &&
                  [80, 90, 100, 110, 120].includes(item.bilan_passif_model.id)
                "
              >
                <template v-slot:prepend-inner>
                  <VProgressCircular
                    v-if="
                      isTotal1Loading && item.total1 == isTotal1LoadingValue
                    "
                    indeterminate
                    color="primary"
                    size="20"
                  ></VProgressCircular>
                  <VIcon
                    slot="activator"
                    v-if="
                      item.usertotal1 !== null &&
                      item.date_total1 !== null &&
                      item.total1 != 0
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.usertotal1} ${t(
                        'at'
                      )} ${new Date(item.date_total1).toLocaleString('fr-FR')}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                {{ item.total1 ?? Number(0).toFixed(2) }}
              </span>
            </td>

            <td
              class="border-v-table text-end"
              :class="
                item.bilan_passif_model.type_calcul == 'total'
                  ? 'font-weight-bold text-primary'
                  : ''
              "
              style="width: 15%; padding: 15px"
            >
              <VTextField
                class="textField"
                v-model="item.total2"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                @change="updateTotal2ForBilanItem(item, hide)"
                v-if="item.bilan_passif_model?.type_calcul == 'compte'"
              >
                <!--  -->
                <template v-slot:prepend-inner>
                  <VProgressCircular
                    v-if="
                      isTotal2Loading && item.total2 == isTotal2LoadingValue
                    "
                    indeterminate
                    color="primary"
                    size="20"
                  ></VProgressCircular>
                  <VIcon
                    slot="activator"
                    v-if="
                      item.usertotal2 !== null &&
                      item.date_total2 !== null &&
                      item.total2 != 0
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.usertotal2} ${t(
                        'at'
                      )} ${new Date(item.date_total2).toLocaleString('fr-FR')}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                {{ item.total2 ?? Number(0).toFixed(2) }}
              </span>
            </td>
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
    </div>
  </VCard>
</template>

<script setup>
import { useBilan } from "@/composables/bilan";
import { ref } from "vue";
import { useRoute } from "vue-router";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const route = useRoute();
const router = useRouter();
const form = ref();
const isActif = ref(true);
const activeTab = ref("actif");

const {
  getBilan,
  currentBilan,
  bilanDetails,
  bilanPassifDetails,
  isCalculating,
  calculateBilan,
  isExportingBilans,
  handleBilanExport,
  updateTotal4ForBilan,
  updateTotal2ForBilan,
  updateTotal1ForBilan,
  openMailModal,
  isSendMailDialogOpen,
  isSendingMail,
  mailForm,
  bilanStore,
  handleMailSending: handleMailSendingComposable,
  getEmailsUsers,
  users,
  closeModal,
  isConfirmChoiceDialogVisible,
  closeDisplayDoubleChoiceCalcul,
  handleDisplayDoubleChoiceCalcul,
} = useBilan(t, showSnackbar);

const isTotal4Loading = ref(false);
const isTotal4LoadingValue = ref(null);
const isTotal2Loading = ref(false);
const isTotal2LoadingValue = ref(null);
const isTotal1Loading = ref(false);
const isTotal1LoadingValue = ref(null);

const isValidationDialogOpen = ref(false);

const isValidateCpcs = ref(false);
const openValidationDialog = () => {
  isValidationDialogOpen.value = true;
};

const closeValidationDialog = () => {
  isValidationDialogOpen.value = false;
};

const handleExport = async () => {
  await handleBilanExport(route.params.id);
};

const handleMailSending = async () => {
  form.value.validate().then(async ({ valid }) => {
    if (!valid) return;
    const isSuccess = await handleMailSendingComposable(route.params.id);
    console.log(isSuccess);
    if (isSuccess) {
      showSnackbar(t("mail-sent-successfully"), {
        color: "success",
      });
      mailForm.value.to = [];
      mailForm.value.cc = [];
    } else {
      showSnackbar(t("error-occured"), {
        color: "error",
      });
    }

    closeModal();
  });
};

const updateTotal4ForBilanItem = async (item, hide) => {
  isTotal4Loading.value = true;
  isTotal4LoadingValue.value = item.total4;
  if (!item.total4) {
    item.total4 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal4ForBilan(item);
  if (isSuccessfull) {
    await getBilan(route.params.id);
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

const updateTotal2ForBilanItem = async (item, hide) => {
  isTotal2Loading.value = true;
  isTotal2LoadingValue.value = item.total2;
  if (!item.total2) {
    item.total2 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal2ForBilan(item);
  if (isSuccessfull) {
    await getBilan(route.params.id);
    showSnackbar(t("updated-successfully-for", { model: item.label }), {
      color: "success",
    });
  } else {
    showSnackbar(t("error-occured"), {
      color: "error",
    });
  }
  isTotal2Loading.value = false;
  isTotal2LoadingValue.value = null;
};
const updateTotal1ForBilanItem = async (item, hide) => {
  isTotal1Loading.value = true;
  isTotal1LoadingValue.value = item.total1;
  if (!item.total1) {
    item.total1 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal1ForBilan(item);
  if (isSuccessfull) {
    await getBilan(route.params.id);
    showSnackbar(t("updated-successfully-for", { model: item.label }), {
      color: "success",
    });
  } else {
    showSnackbar(t("error-occured"), {
      color: "error",
    });
  }
  isTotal1Loading.value = false;
  isTotal1LoadingValue.value = null;
};

const handleBilanCalculation = async () => {
  await calculateBilan(route.params.id, false);
};

const handleAllBilanCalculation = async () => {
  await calculateBilan(route.params.id, true);
};

const confirmValidation = async () => {
  isValidateCpcs.value = true;
  try {
    const isSuccess = await bilanStore.valideBilan(route.params.id);
    console.log("succ", isSuccess);

    if (isSuccess.success) {
      showSnackbar(t("Bilan validé avec succès !"), { color: "success" });
      await getBilan(route.params.id);
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

const redirectToList = async () => {
  router.push({ name: "bilan-list" });
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
onMounted(async () => {
  await getBilan(route.params.id);
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

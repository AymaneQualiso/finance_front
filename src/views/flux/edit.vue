<template>
  <VDialog v-model="isSendMailDialogOpen" persistent max-width="600">
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isSendingMail" @click="closeModal" />

    <!-- Dialog Content -->
    <VCard
      :title="$t('Envoyer FLUX par Email')"
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
  <VCard :title="$t('Flux')" v-if="$can('flux.update')">
    <template #title>
      <div class="d-md-flex justify-space-between align-center w-100">
        <div class="d-flex align-center flex-wrap">
          <span class="me-2">{{
            $t("Compte de Produits et Charges (Hors Taxes)")
          }}</span>
          <VChip
            v-if="currentFlux.status"
            :color="getStatusColor(currentFlux.status)"
            :text-color="
              currentFlux.status === 'validee' ? 'error' : 'red darken-2'
            "
            style="font-size: 18px; margin-left: 5em"
          >
            {{ currentFlux.status }}
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
      <span v-tooltip="$t('send-mail-flux')">
        <VBtn
          color="primary"
          @click="openMailModal()"
          v-if="$can('flux.update')"
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
        v-if="$can('flux.export')"
      >
        <VIcon v-if="!isExportingCpcs" class="tabler-file-x" size="20"></VIcon>
        &nbsp;
        <span v-if="!isExportingFluxs">{{ $t("export") }}</span>
        <VProgressCircular
          v-else
          indeterminate
          color="primary"
          size="24"
        ></VProgressCircular>
      </VBtn>
      <!-- <VBtn
        variant="tonal"
        class="me-2"
        color="success"
        @click="openValidationDialog"
        v-if="$can('flux.valide') && currentFlux.status !== 'Validé'"
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
      </VBtn> -->
      <VBtn
        class="me-2"
        color="primary"
        @click="handleFluxCalculation()"
        v-if="
          $can('flux.calculate') &&
          currentFlux.status !== 'Validé' &&
          currentFlux.status !== 'Clôturé'
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
          $can('flux.valide') &&
          currentFlux.status !== 'Validé' &&
          currentFlux.status !== 'Clôturé'
        "
      >
        <VIcon v-if="!isValidateflux" class="tabler-checkbox" size="20"></VIcon>
        &nbsp;
        <span v-if="!isValidateflux">{{ $t("Valider") }}</span>
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
            {{
              $t("Êtes-vous sûr de vouloir valider ce Flux de tresorerie  ?")
            }}
          </VCardText>
          <VCardText class="d-flex justify-end flex-wrap gap-3">
            <VBtn
              color="secondary"
              variant="tonal"
              @click="closeValidationDialog"
              :disabled="isValidateflux"
            >
              {{ $t("Cancel") }}
            </VBtn>
            <VBtn
              :disabled="isValidateflux"
              color="primary"
              @click="confirmValidation"
            >
              <VProgressCircular
                v-if="isValidateflux"
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
      <span>{{ $t("FLUX") }} :</span>
      <span class="text-primary mx-4">{{ currentFlux.label }}</span> |
      <span class="ml-4">{{ $t("BG") }} :</span>
      <span class="text-primary mx-4">{{
        currentFlux.balance_sheet_label
      }}</span>
      |
      <span v-if="!currentFlux.flag_bg_consolide" class="ml-4">{{ $t("Sté") }} :</span>
      <span v-if="!currentFlux.flag_bg_consolide" class="text-primary mx-4">{{ currentFlux.company }}</span> {{ currentFlux.flag_bg_consolide ? '' : '|' }}
      <span class="ml-4">{{ $t("PC") }} :</span>
      <span class="text-primary mx-4">{{ currentFlux.chart_account }}</span>
    </div>
    <div>
      <VTable v-if="!isCalculating">
        <thead>
          <tr class="">
            <th class="text-center border-v-table font-weight-bold" rowspan="2">
              {{ $t("Eléments") }}
            </th>
            <th class="text-center border-v-table font-weight-bold">
              <span v-if="currentFlux.balance_current?.month">
                {{
                  currentFlux?.balance_current?.month +
                  "/" +
                  currentFlux?.balance_current?.year
                }}
              </span>
              <span v-else>{{ $t("Mois M") }}</span>
            </th>
            <th class="text-center border-v-table font-weight-bold"></th>
            <th class="text-center border-v-table font-weight-bold">
              <span v-if="currentFlux.balance_previous?.month">
                {{
                  currentFlux?.balance_previous?.month +
                  "/" +
                  currentFlux?.balance_previous?.year
                }}
              </span>
              <span v-else> {{ $t("Mois M - 1") }}</span>
            </th>
            <th class="text-center border-v-table font-weight-bold"></th>
            <th class="text-center border-v-table font-weight-bold">
              <span v-if="currentFlux.balance_previous_2?.month">
                {{
                  currentFlux?.balance_previous_2?.month +
                  "/" +
                  currentFlux?.balance_previous_2?.year
                }}
              </span>
              <span v-else>{{ $t("Mois M - 2") }} </span>
            </th>
            <th class="text-center border-v-table font-weight-bold"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in fluxDetails" :key="item.id">
            <td
              style="width: 30%"
              class="border-v-table"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
            >
              {{ item.label }}
            </td>
            <td
              class="border-v-table text-end"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 12%"
            >
              <VTextField
                class="textField"
                v-model="item.total1"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                :hint="
                  item.flux_tresorerie_model.id == 170
                    ? $t('Enter value or modify it')
                    : ''
                "
                persistent-hint
                @change="updateTotal1ForFluxItem(item, hide)"
                v-if="
                  [
                    'Acquisitions des immobilisations',
                    'Dette Inter- Société début de periode 31/12 N-1',
                    'Autres dettes début de periode 31/12 N-1',
                  ].includes(item.label)
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
                      item.total1_updated_by !== null &&
                      item.total1 != isTotal1LoadingValue
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.total1_updated_by} ${t(
                        'at'
                      )} ${new Date(item.total1_updated_at).toLocaleString(
                        'fr-FR'
                      )}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                <span
                  :class="
                    item.flux_tresorerie_model.id == 330 && item.total1 != 0
                      ? 'text-error'
                      : ''
                  "
                >
                  {{ item.total1 ?? Number(0).toFixed(2) }}
                </span>
              </span>
              <p
                class="text-error text-sm"
                v-if="item.flux_tresorerie_model.id == 330 && item.total1 != 0"
              >
                {{ $t("la valeur doit être égale à 0.") }}
              </p>
            </td>
            <td
              class="border-v-table text-center"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 3%"
            >
              {{ item.total1RE }}
            </td>
            <td
              class="border-v-table text-end"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 12%"
            >
              <VTextField
                class="textField"
                v-model="item.total2"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                :hint="
                  item.flux_tresorerie_model.id == 170
                    ? $t('Enter value or modify it')
                    : ''
                "
                persistent-hint
                @change="updateTotal2ForFluxItem(item, hide)"
                v-if="
                  [
                    'Acquisitions des immobilisations',
                    'Dette Inter- Société début de periode 31/12 N-1',
                    'Autres dettes début de periode 31/12 N-1',
                  ].includes(item.label)
                "
              >
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
                      item.total2_updated_by !== null &&
                      item.total2 != isTotal2LoadingValue
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.total2_updated_by} ${t(
                        'at'
                      )} ${new Date(item.total2_updated_at).toLocaleString(
                        'fr-FR'
                      )}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                <span
                  :class="
                    item.flux_tresorerie_model.id == 330 && item.total2 != 0
                      ? 'text-error'
                      : ''
                  "
                >
                  {{ item.total2 ?? Number(0).toFixed(2) }}
                </span>
              </span>
              <p
                class="text-error text-sm"
                v-if="item.flux_tresorerie_model.id == 330 && item.total2 != 0"
              >
                {{ $t("la valeur doit être égale à 0.") }}
              </p>
            </td>
            <td
              class="border-v-table text-center"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 3%"
            >
              {{ item.total2RE }}
            </td>
            <td
              class="border-v-table text-end"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 12%"
            >
              <VTextField
                class="textField"
                v-model="item.total3"
                :placeholder="t('new-total-previous')"
                type="number"
                min="0"
                :hint="
                  item.flux_tresorerie_model.id == 170
                    ? $t('Enter value or modify it')
                    : ''
                "
                persistent-hint
                @change="updateTotal3ForFluxItem(item, hide)"
                v-if="
                  [
                    'Acquisitions des immobilisations',
                    'Dette Inter- Société début de periode 31/12 N-1',
                    'Autres dettes début de periode 31/12 N-1',
                  ].includes(item.label)
                "
              >
                <template v-slot:prepend-inner>
                  <VProgressCircular
                    v-if="
                      isTotal3Loading && item.total3 == isTotal3LoadingValue
                    "
                    indeterminate
                    color="primary"
                    size="20"
                  ></VProgressCircular>
                  <VIcon
                    slot="activator"
                    v-if="
                      item.total3_updated_by !== null &&
                      item.total3 != isTotal3LoadingValue
                    "
                    color="warning"
                    icon="tabler-alert-triangle"
                    size="16"
                    class="ms-2"
                    v-tooltip="
                      `${t('changed-by')} ${item.total3_updated_by} ${t(
                        'at'
                      )} ${new Date(item.total3_updated_at).toLocaleString(
                        'fr-FR'
                      )}`
                    "
                  />
                </template>
              </VTextField>
              <span v-else>
                <span
                  :class="
                    item.flux_tresorerie_model.id == 330 && item.total3 != 0
                      ? 'text-error'
                      : ''
                  "
                >
                  {{ item.total3 ?? Number(0).toFixed(2) }}
                </span>
              </span>
              <p
                class="text-error text-sm"
                v-if="item.flux_tresorerie_model.id == 330 && item.total3 != 0"
              >
                {{ $t("la valeur doit être égale à 0.") }}
              </p>
            </td>
            <td
              class="border-v-table text-center"
              :class="
                item.flux_tresorerie_model.type_calcul == 'total' &&
                ![210, 220].includes(item.flux_tresorerie_model.id)
                  ? 'font-weight-bold text-primary'
                  : [90, 100, 120, 140, 150, 170].includes(
                      item.flux_tresorerie_model.id
                    )
                  ? item.flux_tresorerie_model.id == 170
                    ? 'font-weight-bold text-error'
                    : item.total1RE == 'R'
                    ? 'font-weight-bold text-success'
                    : item.total1RE == 'E'
                    ? 'font-weight-bold text-error'
                    : ''
                  : ''
              "
              style="width: 3%"
            >
              {{ item.total3RE }}
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
import { useFlux } from "@/composables/flux";
import { ref } from "vue";
import { useRoute } from "vue-router";

const showSnackbar = inject("showSnackbar");
const t = inject("t");
const route = useRoute();
const router = useRouter();
const form = ref();
const isValidateflux = ref(false);

const {
  getFlux,
  currentFlux,
  fluxDetails,
  fluxPassifDetails,
  isCalculating,
  calculateFlux,
  isExportingFluxs,
  handleFluxExport,
  updateTotal3ForFlux,
  updateTotal2ForFlux,
  updateTotal1ForFlux,
  openMailModal,
  isSendMailDialogOpen,
  isSendingMail,
  mailForm,
  fluxStore,
  handleMailSending: handleMailSendingComposable,
  getEmailsUsers,
  users,
  closeModal,
} = useFlux(t, showSnackbar);

const isTotal3Loading = ref(false);
const isTotal3LoadingValue = ref(null);
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
  await handleFluxExport(route.params.id);
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

const updateTotal3ForFluxItem = async (item, hide) => {
  isTotal3Loading.value = true;
  isTotal3LoadingValue.value = item.total3;
  if (!item.total3) {
    item.total3 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal3ForFlux(item);
  if (isSuccessfull) {
    await getFlux(route.params.id);
    showSnackbar(t("updated-successfully-for", { model: item.label }), {
      color: "success",
    });
  } else {
    showSnackbar(t("error-occured"), {
      color: "error",
    });
  }
  isTotal3Loading.value = false;
  isTotal3LoadingValue.value = null;
};
const updateTotal2ForFluxItem = async (item, hide) => {
  isTotal2Loading.value = true;
  isTotal2LoadingValue.value = item.total2;
  if (!item.total2) {
    item.total2 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal2ForFlux(item);
  if (isSuccessfull) {
    await getFlux(route.params.id);
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
const updateTotal1ForFluxItem = async (item, hide) => {
  isTotal1Loading.value = true;
  isTotal1LoadingValue.value = item.total1;
  if (!item.total1) {
    item.total1 = Number(0).toFixed(2);
  }

  const isSuccessfull = await updateTotal1ForFlux(item);
  if (isSuccessfull) {
    await getFlux(route.params.id);
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

const handleFluxCalculation = async () => {
  await calculateFlux(route.params.id);
};

const confirmValidation = async () => {
  isValidateflux.value = true;
  try {
    const isSuccess = await fluxStore.valideFlux(route.params.id);
    console.log("succ", isSuccess);

    if (isSuccess.success) {
      showSnackbar(t("FLUX validé avec succès !"), { color: "success" });
      await getFlux(route.params.id);
    }
  } catch (error) {
    console.error("Erreur lors de la validation :", error);
    showSnackbar(t("Une erreur inattendue s'est produite."), {
      color: "error",
    });
  } finally {
    isValidateflux.value = false;
    closeValidationDialog();
  }
};

const redirectToList = async () => {
  router.push({ name: "flux-list" });
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
  await getFlux(route.params.id);
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

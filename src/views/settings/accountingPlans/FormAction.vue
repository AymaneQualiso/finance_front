<template>
  <VDialog v-model="isImportDialogVisible" fullscreen persistent>
    <!-- Dialog close btn -->
    <DialogCloseBtn :disabled="isImportLoading" @click="closeModal" />

    <!-- Dialog Content -->

    <VCard :title="$t('import classes')">
      <div v-if="stepper.isCurrent('file-upload')" class="mx-auto w-50 mt-10">
        <a
          class="text-decoration-underline"
          href="../../../../public/import-template/import_classes_template.xlsx"
          download
        >
          {{ $t("Download Sample File") }}
        </a>
        <!-- File Upload -->
        <VFileInput
          type="file"
          :placeholder="$t('select file')"
          :label="$t('select file')"
          @change="handleFileUpload"
          counter
          show-size
          accept=".xlsx, .xls"
          class="my-4"
        />
      </div>
      <v-container v-if="stepper.isCurrent('sync-headings')" class="mt-10">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-card flat class="pa-4">
              <div
                v-for="(heading, headingIndex) in databaseHeadings"
                :key="headingIndex"
                class="mb-4"
              >
                <v-row align="center" justify="center">
                  <!-- Database Heading Card -->
                  <v-col cols="12" sm="4">
                    <v-card outlined class="position-relative">
                      <v-card-title class="py-2">
                        <span class="text-body-1">{{ $t(heading.key) }}</span>
                      </v-card-title>

                      <!-- Ignored Badge -->
                      <v-chip
                        v-if="heading.isIgnored"
                        color="warning"
                        small
                        class="position-absolute"
                        style="top: 5px; right: 5px"
                      >
                        {{ $t("Ignoré") }}
                      </v-chip>
                    </v-card>
                  </v-col>

                  <!-- Arrow Icon -->
                  <v-col cols="auto" class="d-flex align-center">
                    <v-icon color="success" size="large" class="mx-4">
                      mdi-arrow-right
                    </v-icon>
                  </v-col>

                  <!-- Field Selection -->
                  <v-col cols="12" sm="4">
                    <v-select
                      v-model="heading.tableFieldKey"
                      :items="tableFields"
                      item-title="key"
                      item-value="key"
                      density="comfortable"
                      variant="outlined"
                      @update:model-value="updateHeading(heading)"
                      hide-details
                    ></v-select>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <!-- <div
        v-if="stepper.isCurrent('sync-headings')"
        class="d-flex flex-column gap-4 justify-content-center align-items-center mx-auto w-50 mt-10"
      >
        <div
          v-for="(heading, headingIndex) in databaseHeadings"
          :key="headingIndex"
          class="d-flex gap-2 justify-content-center align-items-center"
        >
          <div>
            <div flat class="pa-4">
              <div
                class="card-header ribbon ribbon-end"
                style="min-height: 50px !important"
              >
                <div v-if="heading.isIgnored" class="ribbon-label bg-warning">
                  {{ $t("Ignoré") }}
                </div>
                <div class="card-title">{{ $t(heading.key) }}</div>
              </div>
            </div>
          </div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              style="width: 40px; height: 40px; margin: 5px 30px; color: green"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </div>
          <div>
            <VSelect
              v-model="heading.tableFieldKey"
              @update:modelValue="updateHeading(heading)"
              class="form-select"
              item-title="key"
              item-value="key"
              :items="tableFields"
            />
          </div>
        </div>
      </div> -->

      <div v-if="stepper.isCurrent('preview')" class="mx-auto w-50 mt-10">
        <div
          v-if="importErrors.length"
          style="
            overflow-x: auto;
            width: 100%;
            background-color: #f44336;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 10px;
            color: white;
            font-size: 14px;
            font-weight: bold;
          "
        >
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px">
            {{ $t("import errors") }}
          </div>
          <div v-for="(error, index) in importErrors" :key="index">
            {{ index + 1 + "- " + error.errorMsg }}
          </div>
        </div>
        <VTable v-if="tableData.length" height="300px" fixed-header>
          <thead>
            <tr>
              <template v-for="(field, index) in databaseHeadings" :key="index">
                <th v-if="!field.isIgnored">
                  <span
                    :class="field.isRequiredBasedOnDatabase ? 'required' : ''"
                    >{{ t(field.key) }}</span
                  >
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, rowIndex) in tableData.slice(0, 5)"
              :key="rowIndex"
            >
              <template
                v-for="(field, colIndex) in databaseHeadings"
                :key="colIndex"
              >
                <td v-if="!field.isIgnored">
                  {{ item[field.key] ?? "-" }}
                </td>
              </template>
            </tr>
          </tbody>
        </VTable>
      </div>

      <VCardText class="d-flex justify-end flex-wrap gap-3">
        <VBtn variant="tonal" color="secondary" @click="closeModal">
          {{ $t("cancel") }}
        </VBtn>
        <VBtn
          color="success"
          v-if="!stepper.isFirst.value"
          @click="
            () => {
              stepper.goToPrevious();
              importErrors = [];
            }
          "
        >
          {{ $t("previous") }}
        </VBtn>
        <VBtn
          color="success"
          v-if="!stepper.isLast.value"
          :disabled="!stepper.current.value.isValid()"
          @click="stepper.goToNext()"
        >
          {{ $t("next") }}
        </VBtn>
        <VBtn v-if="stepper.isLast.value" @click="submitImport">
          {{ $t("import") }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
  <VCard
    :title="`${selectedChartAccount?.label ?? ''}`"
    :loading="isChartAccountLoading"
  >
    <template #append>
      <VBtn
        color="secondary"
        variant="tonal"
        class="me-3"
        @click="redirectToList"
      >
        <VIcon color="secondary" icon="tabler-arrow-back" size="28" />
      </VBtn>

      <!-- <VBtn
        variant="tonal"
        class="me-3"
        @click="() => (isImportDialogVisible = true)"
      >
        Importer des classes
      </VBtn> -->
      <VBtn
        v-if="!isViewMode "
        :disabled="isChartAccountLoading"
        @click="submit"
      >
        {{ t("Confirm") }}
      </VBtn>
    </template>
    <VCard :disabled="isChartAccountLoading" variant="flat">
      <VRow :key="title" class="px-6 py-6" v-if="selectedChartAccount">
        <VCol cols="6">
          <AppTextField
            v-model="selectedChartAccount.label"
            :label="$t('label')"
            :placeholder="$t('label')"
            :clearable="!isViewMode "
            :error-messages="errorMessages.label"
            :readonly="isViewMode "
            class="required"
          />
        </VCol>
        <VCol cols="6">
          <AppCombobox
            v-model="selectedChartAccount.selectedCompanies"
            :label="$t('companies')"
            class="required"
            :placeholder="$t('companies')"
            @change="errorMessages.company = null"
            chips
            :closable-chips="!isViewMode"
            multiple
            :items="companies"
            item-title="label"
            item-value="id"
            :rules="[requiredValidator]"
            :return-object="false"
            :readonly="isViewMode  "
          />
        </VCol>
        <VCol cols="2">
          <AppTextField
            v-model="selectedChartAccount.abv"
            maxLength="3"
            :label="$t('abv')"
            :placeholder="$t('abv')"
            :clearable="!isViewMode"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.abv"
            :readonly="isViewMode"
            class="required"
          />
        </VCol>
        <VCol cols="2">
          <AppCombobox
            v-model="selectedChartAccount.is_active"
            :label="$t('is_active')"
            :placeholder="$t('is_active')"
            :items="getEnums(enums.isActive, $t)"
            item-title="title"
            item-value="key"
            :rules="[requiredValidator]"
            class="required"
            :return-object="false"
            :readonly="isViewMode "
            :clearable="!isViewMode "
          />
        </VCol>
        <VCol cols="2">
          <!-- <AppCombobox
            v-model="selectedChartAccount.locked"
            :label="$t('locked')"
            :placeholder="$t('locked')"
            :items="[
              { key: 1, title: $t('oui') },
              { key: 0, title: $t('non') },
            ]"
            item-title="title"
            item-value="key"
            :rules="[requiredValidator]"
            class="required"
            :return-object="false"
            :readonly="isViewMode"
          /> -->
        </VCol>


      </VRow>

      <v-container class="d-flex justify-end">
        <v-tabs v-model="tab">
          <v-tab :value="1" class="rounded mx-1"> Class 1 </v-tab>

          <v-tab :value="2" class="rounded mx-1"> Class 2 </v-tab>

          <v-tab :value="3" class="rounded mx-1"> Class 3 </v-tab>
        </v-tabs>
      </v-container>

      <VCard :title="`Class ${tab}`">
        <template #append v-if="!selectedChartAccount.locked">
          <VBtn v-if="!isViewMode|| selectedChartAccount.locked " color="primary" @click="openDialog(tab)">
            {{ $t("Add Class") + " " + tab }}
          </VBtn>
        </template>
        <DataTableCore
          v-if="tab === 1"
          key="class1"
          :headers="headers"
          :items="class1List"
          :total="totalClass1"
          :per_page="10"
          :filter="filters"
          @change-filter="changeFilter"
        >
          <template #item.label="{ item }">
            {{ item.label }}
          </template>
          <template #item.is_active="{ item }">
            <StatusChip :title="item.is_active" />
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex justify-end gap-3">
             <TooltipIcon
  v-if="
    $can('chart_accounts.update') &&
    !isViewMode &&
    !selectedChartAccount.locked
  "
  :tooltip-text="$t('edit')"
  icon="tabler-edit"
  color="primary"
  @click="openDialog(1, item)"
/>

            </div>
          </template>
        </DataTableCore>
        <DataTableCore
          v-if="tab === 2"
          key="class2"
          :headers="headers2"
          :items="class2List"
          :total="totalClass2"
          :per_page="10"
          :filter="filters"
          @change-filter="changeFilter"
        >
          <template #item.is_active="{ item }">
            <StatusChip :title="item.is_active" />
          </template>
          <template #item.label="{ item }">
            {{ item.label }}
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex justify-end gap-3">
              <TooltipIcon
                v-if="
                  $can('chart_accounts.update') &&
                  !selectedChartAccount.locked &&
                  !isViewMode
                "
                :tooltip-text="$t('edit')"
                icon="tabler-edit"
                color="primary"
                @click="openDialog(2, item)"
              />
            </div>
          </template>
        </DataTableCore>
        <DataTableCore
          v-if="tab === 3"
          :headers="headers3"
          :items="class3List"
          :total="totalClass3"
          :per_page="10"
          :filter="filters"
          @change-filter="changeFilter"
        >
          <template #item.is_active="{ item }">
            <StatusChip :title="item.is_active" />
          </template>
          <template #item.label="{ item }">
            {{ item.label }}
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex justify-end gap-3">
              <TooltipIcon
                v-if="
                  $can('chart_accounts.update') &&
                  !selectedChartAccount.locked &&
                  !isViewMode
                "
                :tooltip-text="$t('edit')"
                icon="tabler-edit"
                color="primary"
                @click="openDialog(3, item)"
              />
            </div>
          </template>
        </DataTableCore>
      </VCard>

      <!-- Dialog for adding classes -->
      <ClassDialog
        v-model="dialogOpen"
        :classType="classType"
        :classData="currentClassData"
        :parentClasses="parentClasses"
        :onClose="closeDialog"
        @update-class="updateClass"
      />
    </VCard>
  </VCard>
</template>

<script setup>
import { useChartAccountStore, useCoreStore, useCompanyStore } from "@/stores";
import ClassDialog from "@/components/dialogs/chartAccounts/ClassDialog.vue";
import { useApi } from "@/composables/useApi";
import { read, write, utils } from "xlsx";
import { useStepper } from "@vueuse/core";
import SnackBar from "@/plugins/snackbar/SnackBar.vue";

const t = inject("t");

const coreStore = useCoreStore();

const stepper = useStepper({
  "file-upload": {
    title: t("file Upload"),
    isValid: () => importedFile.value !== null,
  },
  "sync-headings": {
    title: t("sync Headings"),
    isValid: () =>
      databaseHeadings.value.every((heading) => heading.tableFieldKey),
  },
  preview: {
    title: t("preview"),
    isValid: () => true,
  },
});
const companyStore = useCompanyStore();
const { companies } = storeToRefs(companyStore);
const { enums } = storeToRefs(coreStore);
const chartAccountStore = useChartAccountStore();
const {
  isChartAccountLoading,
  selectedOriginChartAccount,
  selectedChartAccount,
  class1List,
  class2List,
  class3List,
  totalClass1,
  totalClass2,
  totalClass3,
  toBeEditedClass,
  isEditMode,
  filters,
} = storeToRefs(chartAccountStore);

const isImportDialogVisible = ref(false);
const isImportLoading = ref(false);
const importErrors = ref([]);
const importedFile = ref(null);
// const selectedImportClass = ref(null);
const excelData = ref([]);
const tableFields = ref([]);
const tableData = ref([]);
const databaseHeadings = ref([
  {
    key: "Libellé",
    value: "label",
    isIgnored: false,
    isRequired: true,
  },
  {
    key: "Valeur",
    value: "num",
    isIgnored: false,
    isRequired: true,
  },
  {
    key: "Actif",
    value: "is_active",
    isIgnored: false,
    isRequired: true,
  },
]);

const router = useRouter();
const route = useRoute();
const isViewMode = route.name === "accounting-plan-show";
const showSnackbar = inject("showSnackbar");
// const companies = ref([]);
const errorMessages = ref({
  label: null,
  company: null,
});

const tab = ref(1);
const headers = ref([
  {
    title: t("value"),
    sortable: true,
    key: "num",
    filtervalue: "",
    filterable: true,
    typefilter: "range",
  },
  {
    title: t("label"),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  {
    title: t("Status"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);
const headers2 = ref([
  {
    title: t("value"),
    sortable: true,
    key: "num",
    filtervalue: "",
    filterable: true,
    typefilter: "range",
  },
  {
    title: t("label"),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  // {
  //   title: t("parent"),
  //   sortable: true,
  //   key: "class_account_id",
  //   filtervalue: "",
  //   filterable: true,
  //   typefilter: "text",
  // },
  {
    title: t("status"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);
const headers3 = ref([
  {
    title: t("value"),
    sortable: true,
    key: "num",
    filtervalue: "",
    filterable: true,
    typefilter: "range",
  },
  {
    title: t("label"),
    sortable: true,
    key: "label",
    filtervalue: "",
    filterable: true,
    typefilter: "text",
  },
  // {
  //   title: t("parent"),
  //   sortable: true,
  //   key: "class_account2_id",
  //   filtervalue: "",
  //   filterable: true,
  //   typefilter: "text",
  // },
  {
    title: t("status"),
    sortable: true,
    key: "is_active",
    filtervalue: "",
    filterable: true,
    typefilter: "select",
    itemKey: "key",
    itemTitle: "title",
    selectvalue: getEnums(enums.value.isActive, t),
  },
  {
    title: "",
    sortable: false,
    key: "actions",
  },
]);

const dialogOpen = ref(false);
const classType = ref(null);
const currentClassData = ref(null);
const parentClasses = ref([]);
definePage({
  meta: {
    navActiveLink: "accounting-plan-list",
  },
});

// watch tab , when it changes , reset the filters
watch(tab, () => {
  chartAccountStore.reset("filters");
  chartAccountStore.getChartAccount(route.params?.id);
});

onMounted(async () => {
  await chartAccountStore.getChartAccount(route.params?.id);
  // Fetch companies
  // const { data } = await useApi("companies");
  // companies.value = data.value.data;
  await companyStore.getOnlyActiveCompanies();
});

async function submit() {
  if (!selectedChartAccount.value.label) {
    errorMessages.value.label = t("label is required");
    return;
  } else if (!selectedChartAccount.value.selectedCompanies) {
    errorMessages.value.company = t("company is required");
    return;
  } else if (!selectedChartAccount.value.abv) {
    errorMessages.value.abv = t("abv is required");
    return;
  } else if (!selectedChartAccount.value.is_active) {
    errorMessages.value.is_active = t("status is required");
    return;
  }

  const { statusCode } = await chartAccountStore.updateChartAccount(
    route.params?.id,
    selectedChartAccount.value
  );

  if (statusCode == 200) {
    showSnackbar(t("accounting plan updated with successfully"), {
      color: "success",
    });
  } else {
    showSnackbar(t("error updating"), {
      color: "error",
    });
  }
}

function openDialog(type, item = null) {
  if (item) {
    toBeEditedClass.value = {
      id: item.id,
      label: item.label,
      value: item.num,
      is_active: item.is_active,
      parent: item.class_account_id || item.class_account2_id,
    };
    isEditMode.value = true;
  } else {
    toBeEditedClass.value = null;
    isEditMode.value = false;
  }
  classType.value = type;
  if (type == 2) {
    parentClasses.value = class1List.value;
  } else if (type == 3) {
    parentClasses.value = class2List.value;
  }
  dialogOpen.value = true;
}

function closeDialog() {
  dialogOpen.value = false;
  isEditMode.value = false;
}

async function updateClass(data,isLoading) {
  // add isEditMode to data
  data.isEditMode = isEditMode.value;
  data.id = toBeEditedClass.value?.id;
  // global vars
  let isSuccessful = false;
  let returnCodeStatus = null;
  let response = null;
  // check class type
  if (classType.value === 1) {
    const { data: responeData, statusCode } = await useApi(
      "chartAccounts/class1/" + route.params?.id
    ).post(data);
    isSuccessful = statusCode.value === 201 || statusCode.value === 200;
    returnCodeStatus = statusCode.value;
    response = responeData.value;
  } else if (classType.value === 2) {
    const { data: responeData, statusCode } = await useApi(
      "chartAccounts/class2/" + route.params?.id
    ).post(data);
    isSuccessful = statusCode.value === 201 || statusCode.value === 200;
    returnCodeStatus = statusCode.value;
    response = responeData.value;
  } else if (classType.value === 3) {
    const { data: responeData, statusCode } = await useApi(
      "chartAccounts/class3/" + route.params?.id
    ).post(data);
    isSuccessful = statusCode.value === 201 || statusCode.value === 200;
    returnCodeStatus = statusCode.value;
    response = responeData.value;
  }
  console.log(isLoading.value)
  if (isSuccessful) {
    await chartAccountStore.getChartAccount(route.params?.id);
    closeDialog();
    isLoading.value = false;
    showSnackbar(returnCodeStatus === 201 ? t("Class added successfully") : t("Class updated successfully"), { color: "success" });
  } else {
    showSnackbar(response.message, {
      color: "error",
    });
    isLoading.value = false;
    closeDialog();
  }
}

const handleFileUpload = (event) => {
  isImportLoading.value = true;
  importErrors.value = [];
  importedFile.value = event.target.files[0];

  if (!importedFile.value) {
    showSnackbar(t("please select file"), { color: "error" });
    isImportLoading.value = false;
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    excelData.value = utils.sheet_to_json(sheet, {
      defval: null,
    });
    if (excelData.value.length > 0) {
      tableFields.value = Object.keys(excelData.value[0]).map((key) => ({
        key,
        label: key,
        isIgnored: false,
        selectedOption: key, // Initialize selectedOption with the old heading
        isRequiredBasedOnDatabase:
          databaseHeadings.value.find((item) => item.key === key)?.isRequired ??
          false,
        neverChangingLabel: key,
      }));

      // add the "-" option to the tableFields
      tableFields.value.push({
        key: "-",
        label: "-",
        isIgnored: false,
        selectedOption: "-",
        isRequiredBasedOnDatabase: false,
        neverChangingLabel: "-",
      });

      // update the databaseHeadings tableFieldKey with the according selectedOption from the tableFields
      databaseHeadings.value.forEach((heading) => {
        heading.tableFieldKey = tableFields.value.find(
          (item) => item.key === heading.value
        )?.selectedOption;
        heading.tableFieldKey && updateHeading(heading);
      });
    }
    tableData.value = excelData.value;
  };
  reader.readAsArrayBuffer(importedFile.value);

  isImportLoading.value = false;
};

const submitImport = async () => {
  const headingSwitcher = (heading) => {
    switch (heading) {
      case "Libellé":
        return "label";
      case "Valeur":
        return "value";
      case "Actif":
        return "is_active";
      default:
        return heading;
    }
  };
  const updatedData = excelData.value.map((item) => {
    const updatedItem = {};
    tableFields.value.forEach((field) => {
      if (
        databaseHeadings.value.find(
          (heading) => heading.key === field.selectedOption
        )?.isIgnored ??
        false
      ) {
        return;
      }
      updatedItem[headingSwitcher(field.selectedOption)] = item[field.key];
    });
    return updatedItem;
  });
  // all updatedData should have label, value, is_active
  const allUpdatedDataWithInvalidKeys = updatedData.filter(
    (item) =>
      !item.label ||
      !item.value ||
      item.is_active === undefined ||
      item.is_active === null
  );

  if (allUpdatedDataWithInvalidKeys.length) {
    importErrors.value = [
      {
        errorMsg: t("all classes must have label, value and is_active"),
      },
    ];
    return;
  }

  const class1Data = updatedData.filter(
    (item) => item.value.toString().length === 1
  );
  const class2Data = updatedData.filter(
    (item) => item.value.toString().length === 2
  );
  const class3Data = updatedData.filter(
    (item) => item.value.toString().length === 3
  );

  // value of class1, class2, class3 should be numbers
  const class1DataWithInvalidValue = class1Data.filter((item) =>
    isNaN(item.value)
  );
  const class2DataWithInvalidValue = class2Data.filter((item) =>
    isNaN(item.value)
  );
  const class3DataWithInvalidValue = class3Data.filter((item) =>
    isNaN(item.value)
  );

  if (
    class1DataWithInvalidValue.length ||
    class2DataWithInvalidValue.length ||
    class3DataWithInvalidValue.length
  ) {
    importErrors.value = [
      ...class1DataWithInvalidValue.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value must be a number"),
      })),
      ...class2DataWithInvalidValue.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value must be a number"),
      })),
      ...class3DataWithInvalidValue.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value must be a number"),
      })),
    ];
    return;
  }

  const class1DataExist = class1Data.filter((item) =>
    class1List.value.some((c) => c.num == item.value)
  );

  const class2DataExist = class2Data.filter((item) =>
    class2List.value.some((c) => c.num == item.value)
  );

  const class3DataExist = class3Data.filter((item) =>
    class3List.value.some((c) => c.num == item.value)
  );

  if (
    class1DataExist.length ||
    class2DataExist.length ||
    class3DataExist.length
  ) {
    importErrors.value = [
      ...class1DataExist.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value already exist"),
      })),
      ...class2DataExist.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value already exist"),
      })),
      ...class3DataExist.map((item) => ({
        errorMsg:
          item.label +
          "--" +
          item.value +
          "--" +
          t("class value already exist"),
      })),
    ];
    return;
  }

  const class2DataWithInvalidParent = class2Data.filter(
    (item) =>
      !class1List.value.some((c) => c.num == item.value.toString()[0]) &&
      !class1Data.some((c) => c.value == item.value.toString()[0])
  );

  if (class2DataWithInvalidParent.length) {
    importErrors.value = [
      ...class2DataWithInvalidParent.map((item) => ({
        id: item.id,
        errorMsg: item.value.toString()[0] + " " + t("must exist in class 1"),
      })),
    ];
    return;
  }

  const class3DataWithInvalidParent = class3Data.filter(
    (item) =>
      !class2List.value.some(
        (c) => c.num == item.value.toString().substring(0, 2)
      ) &&
      !class2Data.some((c) => c.value == item.value.toString().substring(0, 2))
  );

  if (class3DataWithInvalidParent.length) {
    importErrors.value = [
      ...class3DataWithInvalidParent.map((item) => ({
        id: item.id,
        errorMsg:
          item.value.toString().substring(0, 2) +
          " " +
          t("must exist in class 2"),
      })),
    ];
    return;
  }

  class1Data.forEach((item) => (item.value = item.value.toString()));
  class2Data.forEach((item) => (item.value = item.value.toString()));
  class3Data.forEach((item) => (item.value = item.value.toString()));

  const { data, statusCode } = await useApi(
    "chartAccounts/import/" + route.params?.id
  ).post({
    class1: class1Data,
    class2: class2Data,
    class3: class3Data,
  });

  if (statusCode.value === 201 || statusCode.value === 200) {
    showSnackbar("Classes imported successfully", { color: "success" });
    await chartAccountStore.getChartAccount(route.params?.id);
    importedFile.value = null;
    excelData.value = [];
    tableFields.value = [];
    tableData.value = [];
    stepper.goTo("file-upload");
    closeModal();
  } else {
    showSnackbar("Error importing classes", {
      color: "error",
    });
  }
};

const closeModal = () => {
  // reset import data
  importErrors.value = [];
  importedFile.value = null;
  // selectedImportClass.value = null;
  isImportDialogVisible.value = false;
  tableData.value = [];
  excelData.value = [];
  tableFields.value = [];
  stepper.goTo("file-upload");
};

const updateHeading = (databaseHeading) => {
  const tableFieldKey = databaseHeading.tableFieldKey;

  // check if the selectedOption is already selected by another field in the databaseHeading.tableFieldKey
  const isAlreadySelected = databaseHeadings.value.some((item) => {
    if (
      item.tableFieldKey === tableFieldKey &&
      item.tableFieldKey !== "-" &&
      item.tableFieldKey !== undefined &&
      item.tableFieldKey !== null &&
      item.key !== databaseHeading.key
    ) {
      return true;
    }
  });

  // fire swal if the selectedOption is already selected by another field
  if (isAlreadySelected) {
    showSnackbar(
      t(
        "this option is already selected by another field, please select another option"
      ),
      {
        color: "error",
      }
    );

    databaseHeading.tableFieldKey = "-";
    databaseHeading.isIgnored = true;
    return;
  }
  databaseHeading.tableFieldKey = tableFieldKey;
  databaseHeading.isIgnored = tableFieldKey === "-";
  // Update the selectedOption of the tableField
  const tableField = tableFields.value.find(
    (item) => item.key === tableFieldKey
  );
  if (tableField) {
    tableField.isIgnored = tableFieldKey === "-";
    tableField.selectedOption =
      tableFieldKey !== "-" ? databaseHeading.key : undefined;
  }
  // databaseHeading.isIgnored = tableFieldKey === "-";
  // tableField.isIgnored = tableFieldKey === "-";
  // tableField.selectedOption = databaseHeading.key;
  // tableField.isRequiredBasedOnDatabase = databaseHeading.isRequired;

  // Update the tableData
  tableData.value = excelData.value.map((item) => {
    const updatedItem = {};
    tableFields.value.forEach((field) => {
      if (!field.isIgnored) {
        updatedItem[field.selectedOption] = item[field.key];
      }
    });
    return updatedItem;
  });
};

async function redirectToList() {
  await router.push({
    name: "accounting-plan-list",
  });
}

function changeFilter(...obj) {
  chartAccountStore.getChartAccount(route.params?.id, ...obj);
}
</script>

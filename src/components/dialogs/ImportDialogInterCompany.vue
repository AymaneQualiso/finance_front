<template>
  <VDialog
    v-model="isDialogVisible"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <VCard>
      <VBtn
        color="#e8e7e9"
        size="40"
        class="ml-auto"
        style="position: absolute; z-index: 1; right: 0; margin: 10px"
        @click="close"
      >
        <VIcon color="black" icon="tabler-x" />
      </VBtn>
      <VCardText>
        <AppStepper
          v-model:current-step="currentStep"
          :items="numberedSteps"
          class="stepper-icon-step-bg"
        />
      </VCardText>
      <VDivider />
      <VCardText>
        <VWindow v-model="currentStep" class="disable-tab-transition">
          <VWindowItem>
            <div
              class="w-100 d-flex flex-column"
              style="justify-content: center; block-size: 73vh"
            >
              <h2 class="mx-auto mb-12">
                {{ title }}
              </h2>
              <div style="justify-content: center; display: flex">
                <VBtn
                  variant="text"
                  width="350"
                  @click="download"
                >
                  {{ $t("ImportMd.Download example file") }} 
                  <VIcon end icon="tabler-cloud-upload" />
                </VBtn>
              </div>
              

              <div class="w-25 mx-auto py-4">
                <VForm ref="form">
                  <VFileInput
                    v-model="file"
                    :placeholder="$t('ImportMd.Import file')"
                    :label="$t('ImportMd.Import file')"
                    prepend-icon="tabler-paperclip"
                    show-size
                    :rules="[requiredValidator]"
                  >
                    <template #selection="{ fileNames }">
                      <template v-for="fileName in fileNames" :key="fileName">
                        <VChip label size="small" color="primary" class="me-2">
                          {{ fileName }}
                        </VChip>
                      </template>
                    </template>
                  </VFileInput>
                </VForm>
              </div>
              <div style="justify-content: center; display: flex">
  <VBtn
    variant="text"
    width="350"
    :disabled="isDownloading"
    @click="handleDownload"
  >
    <VProgressCircular
      v-if="isDownloading"
      indeterminate
      color="primary"
      :size="20"
      width="3"
      class="mr-2"
    />
    {{ $t("ImportMd.Download IntersocieteFile") }}
    <VIcon v-if="!isDownloading" end icon="tabler-book-upload" />
  </VBtn>
</div>

              
              

            </div>
          </VWindowItem>

          <VWindowItem>
            <div style="justify-content: center; block-size: 73vh">
              <VForm ref="formFields">
                <VRow
                  v-for="(item, idx) in Object.keys(fieldsData)"
                  :key="item"
                  class="w-50 mx-auto"
                >
                  <VCol cols="5" md="5">
                    <VAlert
                      color="primary"
                      variant="elevated"
                      style="padding-block: 9px 9px"
                    >
                      {{ item }}
                      <VIcon
                        v-if="requiredFields.includes(fieldsData[item])"
                        icon="tabler-asterisk"
                        size="13"
                        style="margin-block-start: -5px"
                      />
                    </VAlert>
                  </VCol>
                  <VCol cols="2" md="2" class="text-center pt-5">
                    <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
                  </VCol>
                  <VCol cols="5" md="5">
                    <AppCombobox
                      v-model="selected[idx]"
                      :items="notSelectedFileFields"
                      hide-selected
                      clearable
                      :rules="
                        requiredFields.includes(fieldsData[item])
                          ? [requiredValidator]
                          : []
                      "
                    />
                  </VCol>
                </VRow>
              </VForm>
            </div>
          </VWindowItem>
          

          <VWindowItem>
            <div style="block-size: 71vh">
              <VAlert
                v-if="
                  numberedSteps.length - 1 === currentStep && exportFileLink
                "
                type="warning"
                class="mb-4"
              >
                {{ $t("ImportMd.Alert err", { lines: $t("ImportMd.Some") }) }}
              </VAlert>

              <p class="px-3 py-3">
                {{ $t("ImportMd.Message table") }}
              </p>
              <VTable class="text-no-wrap">
                <thead>
                  <tr>
                    <th
                      v-for="el in Object.keys(fieldsData)"
                      v-show="
                        fields.findIndex(
                          (e) => Object.keys(e)[0] === fieldsData[el]
                        ) > -1
                      "
                      :key="el"
                    >
                      {{ el }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in fileBody" :key="row">
                    <td v-for="col in fields" :key="col">
                      {{ row[Object.values(col)[0]] }}
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </div>
          </VWindowItem>
        </VWindow>

        <div
          class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
        >
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0 || isDownloading "
            @click="previousStep"
          >
            <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" />
            {{ $t("ImportMd.Previous") }}
          </VBtn>

          <div class="d-flex flex-wrap gap-4 justify-center">
            <VBtn
              v-if="numberedSteps.length - 1 === currentStep && exportFileLink"
              @click="download"
            >
              {{ $t("ImportMd.Download errors file") }}
            </VBtn>

            <VBtn
              v-if="numberedSteps.length - 1 === currentStep && !exportFileLink"
              :disabled="isUploading"
              color="success"
              @click="onSubmit"
            >
              {{ $t("Confirm") }}
              <VProgressCircular
                v-if="isUploading"
                indeterminate
                color="secondary"
                :size="20"
                width="3"
                class="ml-2"
              />
            </VBtn>

            <VBtn
              v-if="numberedSteps.length - 1 === currentStep && exportFileLink"
              @click="close"
            >
              {{ $t("Close") }}
            </VBtn>
          </div>

          <VBtn
            v-if="numberedSteps.length - 1 != currentStep"
            :disabled="isDownloading "

            @click="nextStep"
          >
            {{ $t("ImportMd.Next") }}
            <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { onMounted, watch } from "vue";

import JsonExcel from "vue-json-excel3";
import { useRouter } from "vue-router";
import XLSX from "xlsx/dist/xlsx.full.min";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  isImportDialogVisible: {
    type: Boolean,
    default: false,
  },
  exportFileLink: {
    type: Object,
    default: null,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
  exampleData: {
    type: Array,
    required: true,
  },
  fieldsData: {
    type: Object,
    required: true,
  },
  requiredFields: {
    type: Array,
    default: null,
  },
  rowsError: {
    type: Number,
    default: 0,
  },
  downloadExampleFile: {
    type: Boolean,
    default: true,
  },
  exampleFileName: {
    type: String,
    default: "",
  },
  
  balanceid: {
    type: Number,  // Change from String to Number
    default: 0,    // Provide a numeric default value
  },
  FileName: {
    type: String,
    default: "example_file.xls",
  },
  exportDatainterCompany:{
    type: Function,
    default:true,
  },
      importType: { type: String, default: null }, 

});

const emits = defineEmits(["onSubmit", "close", "removeFile"]);
const form = ref();
const formFields = ref();
const btnExport = ref();
const file = ref();
const currentStep = ref(0);
const selected = ref([]);
const fileFields = ref([]);
const fileBody = ref([]);
const fields = ref([]);
const t = inject("t");
const showSnackbar = inject('showSnackbar')
const isDownloading = ref(false);




const numberedSteps = [
  {
    title: t("Importation"),
    subtitle: "",
  },
  {
    title: t("Validation"),
    subtitle: "",
  },
  {
    title: t("Registration"),
    subtitle: "",
  },
];
const router = useRouter();
const { exampleFileUrl, fetchExampleFIle } = useExampleImportFile(router);

// onMounted(async () => {
//   await fetchExampleFIle(props.importType);
   
// });

watch(
  () => selected.value,
  () => {
    fields.value = [];
    selected.value.map((it, idx) => {
      Object.keys(props.fieldsData).map((key, i) => {
        if (i === idx) {
          let index = fileFields.value.findIndex((x) => x === it);
          if (index > -1) fields.value.push({ [props.fieldsData[key]]: index });
        }
      });
    });
  },
  { deep: true }
);

watch(
  () => props.isImportDialogVisible,
  () => {
    currentStep.value = 0;
    fields.value = [];
    selected.value = [];
    file.value = [];
    emits("removeFile");
  }
);

function onChange() {
  if (file.value[0]) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      fileFields.value = data[0];
      data.shift();
      fileBody.value = data.slice(0, 5);
      getFileField();
    };
    reader.readAsBinaryString(file.value[0]);
  }
}

// function getFileField(){
//   Object.keys(props.fieldsData).map((key, idx) => {
//     fileFields.value.map(el => {
//       if(key.includes(el) || el.includes(key))
//         selected.value[idx] = el
//     })
//   })
// }
function getFileField() {
  const fieldIndexMap = new Map();

  // Populate the map with the file fields and their indices
  fileFields.value.forEach((field, idx) => {
    fieldIndexMap.set(field, idx);
  });

  const tempSelected = new Array(Object.keys(props.fieldsData).length).fill(
    null
  );

  // First pass: exact matches
  Object.keys(props.fieldsData).forEach((key, idx) => {
    if (fieldIndexMap.has(key)) {
      tempSelected[idx] = key;
    }
  });

  // Second pass: substring matches only if no exact match was found
  Object.keys(props.fieldsData).forEach((key, idx) => {
    if (!tempSelected[idx]) {
      fileFields.value.forEach((el) => {
        if (key.includes(el) || el.includes(key)) {
          tempSelected[idx] = el;
        }
      });
    }
  });

  selected.value = tempSelected;
  // selected.value = tempSelected.filter(value => value !== null);
}

function close() {
  isDialogVisible.value = false;
  emits("close");
  emits("removeFile");
}

function nextStep() {
  if (currentStep.value === 0) {
    return form.value.validate().then(({ valid }) => {
      if (!valid) return;
      const validMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel', 
        'text/csv'
      ];
      if (!validMimeTypes.includes(file.value[0].type)) {
        showSnackbar(t('Ce fichier n\'est pas valide. Il doit être un fichier XLSX, XLS, ou CSV.'), { color: 'error' })
        return;
      }
      onChange();
      currentStep.value++;
    });
  }
  if (currentStep.value === 1) {
    return formFields.value.validate().then(({ valid }) => {
      if (!valid) return;
      currentStep.value++;
    });
  }
}

function previousStep() {
  if (numberedSteps.length - 1 === currentStep.value) {
    emits("removeFile");
  }
  currentStep.value--;
  if (currentStep.value === 0) {
    selected.value = [];
    fileFields.value = [];
  }
}

async function onSubmit() {
  emits("onSubmit", { file: file.value[0], fields: fields.value });
}

async function handleDownload() {
  if (isDownloading.value) return; 

  isDownloading.value = true; 

  try {
    await props.exportDatainterCompany(); 
  } catch (error) {
    console.error("Download failed:", error);
  } finally {
    isDownloading.value = false; 
  }

}

async function download() {
  // Trigger fetchExampleFile before proceeding
  console.log('Fetching the latest file...');
  const savedImportType = localStorage.getItem('importType') || '';

  console.log('item',savedImportType);
  
  await fetchExampleFIle(savedImportType);

  console.log('File URL fetched:', exampleFileUrl.value);

  // Perform download after fetching the URL
  if (!exampleFileUrl.value) {
    if (props.exportFileLink) {
      console.log('Using exportFileLink...');
      props.exportFileLink.click();
    } else if (props.exampleFileName) {
      console.log('Downloading example file...');
      const link = document.createElement("a");
      link.href = props.exampleFileName;
      link.download = props.FileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } else {
    console.log('Downloading fetched file...');
    const link = document.createElement("a");
    link.href = exampleFileUrl.value;
    link.download = props.FileName || 'example_file.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}





const isDialogVisible = computed(() => {
  return props.isImportDialogVisible;
});

const notSelectedFileFields = computed(() => {
  return fileFields.value.filter((el) => !selected.value.includes(el));
});
</script>

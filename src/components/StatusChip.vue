<template>
  <VChip v-if="title" :label="false" :color="color">
    {{ $t("Enums." + title) }}
  </VChip>
</template>

<script setup>
import { useCoreStore } from "@/stores";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);

const color = ref("secondary");

onMounted(() => {
  getKeyEnum(props.title);
});

watch(
  () => props.title,
  () => {
    getKeyEnum(props.title);
  }
);

function getKeyEnum(title) {
  Object.keys(enums.value).map((e) => {
    Object.keys(enums.value[e]).map((el) => {
      if (enums.value[e][el] === title) {
        switch (title) {
          case "active":
            color.value = "primary";
            break;
          case "inactive":
            color.value = "error";
            break;
          case "required":
            color.value = "info";
            break;
          case "optional":
            color.value = "warning";
            break;
          case "planed":
            color.value = "info";
            break;
          case "open":
            color.value = "success";
            break;
          case "closed":
            color.value = "warning";
            break;
          case "oui":
            color.value = "primary";
            break;
          case "non":
            color.value = "error";
            break;
            case "ouvert":
            color.value = "primary";
            break;
          case "cloture":
            color.value = "error";
            break;
            
        }
      }
    });
  });
}
</script>

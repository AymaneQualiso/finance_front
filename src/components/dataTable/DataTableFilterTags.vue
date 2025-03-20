<template>
  <tr>
    <td :colspan="columns.length">
      <div class="d-flex align-center">
        <div v-for="key in Object.keys(filter)" :key="key">
          <VChip
            v-if="filterKey(key) && getName(key) != 'NC'"
            closable
            class="me-1"
            color="primary"
            @click:close="close(key)"
          >
            {{ getName(key) }}: {{ getValue(key, filter[key]) }}
          </VChip>
        </div>
        <VIcon
          v-if="filterKeys.length"
          color="primary"
          icon="tabler-refresh"
          size="28"
          @click="refresh"
        />
      </div>
    </td>
  </tr>
</template>

<script setup>
import { every } from "lodash";

const props = defineProps({
  columns: {
    type: Object,
    required: true,
  },
  filter: {
    type: Object,
    required: true,
  },
  headers: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(["closeChip"]);
const t = inject("t");

const filterKeys = computed(() => {
  return Object.keys(props.filter).filter((e) => filterKey(e));
});

const filterKey = (key) => {
  every([props.filter[key]], { start: null, end: null });

  if (["per_page", "page", "sort_key", "order", "NC"].includes(key))
    return false;
  else if (every([props.filter[key]], { start: null, end: null })) return false;
  else if (!props.filter[key]) return false;
  else if (getName(key) == "NC") return false;
  else return true;
};

function getName(key) {
  const res = props.headers.find((el) => el.key === key);

  return res ? res.title : "NC";
}



function getValue(key, val) {
  const res = props.headers.find((el) => el.key === key);
  if (res && ["date", "range"]?.includes(res.typefilter)) {
     return `${res.filtervalue.start || " Ꚙ "} ${t("to")} ${
      res.filtervalue.end || " Ꚙ "
    }`;
 }

  if (res && ["date", "range"].includes(res.typefilter)) {
    let storedFilters = JSON.parse(localStorage.getItem("filters")) || {};

    if (!res.filtervalue || (!res.filtervalue.start && !res.filtervalue.end)) {
      if (storedFilters[key] && storedFilters[key].start && storedFilters[key].end) {
        return `${storedFilters[key].start} ${t("to")} ${storedFilters[key].end}`;
      }
      return `${storedFilters[key]?.start || " Ꚙ "} ${t("to")} ${storedFilters[key]?.end || " Ꚙ "}`;
    }

    storedFilters[key] = {
      start: res.filtervalue?.start,
      end: res.filtervalue?.end
    };
    localStorage.setItem("filters", JSON.stringify(storedFilters));

    return `${res.filtervalue.start || " Ꚙ "} ${t("to")} ${res.filtervalue.end || " Ꚙ "}`;
  }

  if (res && res.typefilter === "select") {
    const resVal = res.selectvalue?.find((el) => el[res.itemKey] === val);
    return resVal && resVal[res.itemTitle] ? resVal[res.itemTitle] : val;
  }

  return val;
}

function close(key) {
  emits("closeChip", [key]);
}

function refresh() {
  emits("closeChip", filterKeys.value);
}
</script>

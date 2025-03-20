<template>
  <span>
    <VMenu
      v-model="showFilter"
      :close-on-content-click="false"
      location="bottom start"
      :persistent="isPersistent"
    >
      <VCard
        ref="child"
        class="px-3 py-3"
      >
        <div class="d-flex align-end gap-3">
          <AppTextField
            v-if="col.typefilter === 'text'"
            v-model="col.filtervalue"
            style="inline-size: 200px"
            :label="col.title"
            :placeholder="col.title"
            clearable
            
            @update:model-value="changeFilter(col)"
          />
          <div v-if="col.typefilter === 'date'">
            <AppDateTimePicker
              v-model="col.filtervalue.start"
              style="inline-size: 200px"
              label="Date debut"
              variant="outlined"
              :placeholder="col.title"
              clearable
              @input="applyFilter(col);"
              @click="isPersistent = true"
              @click:clear="refresh(col)"
            />
            <AppDateTimePicker
              v-model="col.filtervalue.end"
              style="inline-size: 200px"
              label="Date fin"
              variant="outlined"
              :placeholder="col.title"
              clearable
              @input="applyFilter(col)"
              @click="isPersistent = true"
              @click:clear="refresh(col)"
            />
          </div>
          <div v-if="col.typefilter === 'select'">
            <!--
              <VLabel style="font-size: 0.8125rem !important; margin-bottom: 4px">
              {{ col.title }}
              </VLabel> 
            -->
            <!-- <AppCombobox
              v-model="col.filtervalue"
              :label="col.title"
              style="inline-size: 200px"
              :items="col.selectvalue"
              :placeholder="col.title"
              clearable
              :item-title="col.itemTitle"
              :item-value="col.itemKey"
              @update:model-value="applyFilter(col, $event)"
            /> -->
            <VSelect
             v-model="col.filtervalue"
            :label="col.title"
             style="inline-size: 200px"
            :items="col.selectvalue"
            :placeholder="col.title"
             clearable
            :item-title="col.itemTitle"
            :item-value="col.itemKey" 
            @update:model-value="applyFilter(col, $event)"
            :return-object="false"
           />
          </div>
          <div v-if="col.typefilter === 'range'">
            <AppTextField
              v-model="col.filtervalue.start"
              style="inline-size: 200px"
              :label="col.title + ' min'"
              :placeholder="col.title + ' min'"
              clearable
              @input="changeFilter(col)"
              @click:clear="refresh(col)"

            />
            <AppTextField
              v-model="col.filtervalue.end"
              style="inline-size: 200px"
              :label="col.title + ' max'"
              :placeholder="col.title + ' max'"
              clearable
              @input="changeFilter(col)"
              @click:clear="refresh(col)"

            />
          </div>
  
          <VIcon
            color="primary"
            icon="tabler-rotate-clockwise"
            size="28"
            @click="refresh(col)"
          />
        </div>
  
        <VIcon
          class="position-absolute"
          icon="tabler-x"
          style=" font-size: 18px;inset-block-start: 8px; inset-inline-end: 8px"
          @click="showFilter = !showFilter"
        />
      </VCard>
      <template #activator="{ props: vMenuProps }">   
        <VIcon
          v-if="col.filterable"
          v-bind="vMenuProps"
          :icon="isChanged ? 'tabler-filter-filled' : 'tabler-filter'"
          @click="emits('activeFilter', isActiveFilter === col.key ? '' : col.key)"
        />
      </template>
    </VMenu>
  </span>
</template>

<script setup>
import { debounce, isObject } from "lodash"
import { watch } from "vue"

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  isActiveFilter: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "left",
  },
})

const emits = defineEmits(["refresh", "changeFilter", "activeFilter"])

const isPersistent = ref(false)

const showFilter = ref(false)

const formatFilterParams = propsCol => {
  if(
    (propsCol?.typefilter == 'date' || propsCol?.typefilter == 'range')
    && !isObject(propsCol.filtervalue)
  ) {
    propsCol.filtervalue = {}
  }
  
  return propsCol
}

formatFilterParams(props.column)

const col = ref(formatFilterParams(props.column))

const isChanged = ref(false)

watch(
  () => props.column,
  () => {
    col.value = formatFilterParams(props.column)
    isChanged.value = checkFilter(props.column)
  },
  { deep: true },
)

const filterStyle = computed(() => {
  return {
    'position': 'absolute',
    'background-color': 'rgb(var(--v-theme-surface))',
    'box-shadow': '0 0.5rem 1rem rgb(15 20 34 / 38%)',
    'border-radius': '10px',
    'z-index': '9999',
    'margin-left': props.position === 'left' ? '' : '-100px',
  }
})

// watch(
//   () => col.value.showfilter,
//   debounce((val) => {
//     emits('activeFilter', '')
//   }, 10000)
// );

function refresh(column) {
  if(["range", "date"]?.includes(column.typefilter)) column.filtervalue = { start: null, end: null }
  else column.filtervalue = ""
  isChanged.value = checkFilter(column)
  applyFilter(column)
}


const changeFilter = debounce((column, e = null) => {
  applyFilter(column, (e = null))
}, 800)

const changePersistent = debounce(val => {
  isPersistent.value = val
}, 800)

function applyFilter(column, e = null) {
  
  const obj = {}
  
  // if (column.typefilter === "select"){
  //   if(typeof e === "object"){
  //     column.filtervalue = e ? e.id : ""
  //   }else{
  //     column.filtervalue = e ? e : ""
  //   }
  // }
  if(column.typefilter === "select"){
    // obj[column.key] = column.filtervalue ? column.filtervalue[column.itemKey] : ""
    obj[column.key] = column.filtervalue ? column.filtervalue : ""
  }else{
    obj[column.key] = column.filtervalue ? column.filtervalue : ""
  }
  emits("changeFilter", obj)
  isChanged.value = checkFilter(column)

  changePersistent(false)
}

function checkFilter(column) {
  return !!((["range", "date"].includes(column.typefilter) &&
      (column.filtervalue.start || column.filtervalue.end)) ||
    (!["range", "date"].includes(column.typefilter) && column.filtervalue))
}
</script>

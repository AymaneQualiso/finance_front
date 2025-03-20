<template>
  <VCol
    :cols="12"
    class="mb-5"
  >
    <div class="form-check">
      <input
        :id="title"
        class="form-check-input"
        type="checkbox"
        :checked="isAllTitlePermissionsExist(props.permissions)"
        @change="onChangeAll($event, props.title)"
      >
    
      <label
        class="form-check-label text-dark"
        :for="title"
      >{{ translateTitle(title) }}</label>
    </div>
  </VCol>
  
  <VCol cols="12" md="2"
    v-for="permission in sortedPermissions"
    :key="permission"
    class="p-4"
  >
    <div class="form-check p-4">
      <input
        :id="permission.name"
        class="form-check-input"
        type="checkbox"
        :checked="isPermissionExist(permission.name)"
        @change="onChange($event, permission)"
      />
      <label
        class="form-check-label"
        :for="permission.name"
      >{{t(extractAction(permission.name))}}</label>
    </div>
  </VCol>
</template>

<script setup>
import {
  filter as _filter,
  includes as _includes,
  map as _map,
  uniq as _uniq,
  cloneDeep,
} from "lodash"

import { useRoleStore } from "@/stores"

const props = defineProps({
  title: String, 
  permissions: Array,
})

const store = useRoleStore()
const { rolePermissions  } = storeToRefs(store)
const t = inject("t")

const order = ["index", "show", "store", "update", "destroy"];
const sortedPermissions = computed(() => {
  const orderedPermissions = [];
  const unorderedPermissions = [];

  props.permissions.forEach((permission) => {
    const action = extractAction(permission.name);
    if (order.includes(action)) {
      orderedPermissions.push(permission);
    } else {
      unorderedPermissions.push(permission);
    }
  });

  orderedPermissions.sort((a, b) => {
    const aAction = extractAction(a.name);
    const bAction = extractAction(b.name);
    return order.indexOf(aAction) - order.indexOf(bAction);
  });

  return [...orderedPermissions, ...unorderedPermissions];
});

function translateTitle(key) {
  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
  return t(formattedKey);
}

function isPermissionExist(permission) {
  return _includes(_map(rolePermissions.value, ({ name }) => name), permission)
}

function isAllTitlePermissionsExist(permissions) {
  for (let i = 0; i < permissions.length; i++) {
    if (!isPermissionExist(permissions[i]?.name)) {
      return false
    }
  }

  return true
}

function onChange(event, permission) {
  if (!event.target.checked) {
    const perms = removePermission(
      permission,
      cloneDeep(rolePermissions.value),
    )

    store.setRolePermissions(perms)
    
    return
  }

  const perms = pushPermission(
    permission,
    cloneDeep(rolePermissions.value),
  )

  store.setRolePermissions(perms)
}

function onChangeAll(event, title) {
  if (!event.target.checked) {
    const perms = _filter(cloneDeep(store.rolePermissions), perm => perm.group_name !== title)

    store.setRolePermissions(perms)
    
    return
  }
  store.setRolePermissions([
    ...cloneDeep(rolePermissions.value),
    ...cloneDeep(props.permissions),
  ])
}

function pushPermission(permission, permissions) {
  permissions.push(permission)
  
  return _uniq(permissions)
}

function removePermission(permission, permissions) {
  return permissions.filter(function (item) {
    return item.name !== permission.name
  })
}

function extractAction(permission) {
  const parts = permission.split('.')
  
  return parts.length === 2 ? parts[1] : permission
}
</script>

<style lang="scss" scoped>
.form-check {
  display: grid;
  cursor: pointer;
  font-family: system-ui, sans-serif;
  font-size: 1.1rem;
  font-weight: bold;
  gap: 0.5em;
  grid-template-columns: 1em auto;
  line-height: 1.1;
}

label {
  cursor: pointer;

  &:hover{
    opacity: 0.7;
  }
}
</style>

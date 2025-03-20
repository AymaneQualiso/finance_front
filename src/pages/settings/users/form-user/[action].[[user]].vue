<!-- eslint-disable camelcase -->
<template>
  <VSnackbar
    v-model="isSnackbarVisible"
    location="top end"
    :color="snackbarColor"
    variant="flat"
  >
    {{ snackbarMessage }}
  </VSnackbar>
  <VCard
    :title="$t(`${$route.params.action}`)"
    :loading="isUserLoading"
    v-if="hasPermission"
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
      <VBtn
        v-if="isEditable && ($can('users.update') || $can('users.store'))"
        :disabled="isUserLoading || isRolesLoading"
        @click="onFormSubmit"
      >
        {{ $t("Save") }}
      </VBtn>
    </template>
    <VCard :disabled="isRoleLoading" variant="flat">
      <VCardText class="d-flex">
        <VAvatar rounded size="100" class="me-6">
          <VImg :src="changedImg ?? user?.avatar ?? 'errorr'">
            <template #error>
              <VIcon size="100" icon="tabler-user" />
            </template>
          </VImg>
        </VAvatar>
        <form class="d-flex flex-column justify-center gap-4">
          <div class="d-flex flex-wrap gap-2">
            <VBtn color="primary" @click="avatarEl?.click()" v-if="isEditable"
            >
              <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
              <span class="d-none d-sm-block">{{ $t("Changer Avatar") }}</span>
            </VBtn>
            <input
              ref="avatarEl"
              type="file"
              name="file"
              accept=".jpeg,.png,.jpg,GIF"
              hidden
              @input="changeImg"
            />
          </div>
          <p class="text-body-1 mb-0"  v-if="isEditable">
            {{ $t("JPG, GIF ou PNG autorisés. Taille maximale de 800K") }}
          </p>
        </form>
      </VCardText>
      <VDivider />
      <VCardText class="pt-2">
        <VForm
          ref="formElt"
          class="mt-6"
          :readonly="!isEditable"
          @submit.prevent
        >
          <VRow>
            <VCol md="6" cols="12">
              <AppTextField
                v-model="user.name"
                :placeholder="$t('Full Name')"
                :label="$t('Full Name')"
                :rules="[requiredValidator]"
                class="required"
                :error-messages="errors?.name"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="user.email"
                :label="$t('Email')"
                :placeholder="$t('Email')"
                type="email"
                :rules="[requiredValidator]"
                class="required"
                :error-messages="t(errors?.email[0] ?? '')"
              />
            </VCol>
              <VCol cols="12" md="6">
              <VSelect
  v-model="user.roles"
  :label="$t('Role')"
  :placeholder="$t('Role')"
  item-title="name"
  item-value="id"
  single
  :items="transRoles"
  :loading="isRolesLoading"
  :rules="[requiredValidator]"
  class="required"
  :return-object="false"  
  :error-messages="errors?.roles"
  @update:modelValue="handleRoleChange"
/>



            </VCol>
          
            
               <VCol cols="12" md="6">
              <VSelect
                v-model="user.auth_status"
                :label="$t('Status')"
                :placeholder="$t('Status')"
                :items="getEnums(enums.isActive, $t)"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
              />
            </VCol>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="user.phone"
                :label="$t('Phone')"
                :placeholder="$t('Phone')"
              />
            </VCol>
            <!-- <VCol
              md="6"
              cols="12"
            >
              <AppTextField
                v-model="user.registration_number"
                placeholder="registration number..."
                label="registration number"
              />
            </VCol> -->
            <!-- <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="user.pin_code"
                type="number"
                label="pin code"
                placeholder="pin code..."
              />
            </VCol> -->
          
         
            <VCol cols="12" md="6">
              <AppCombobox
                v-model="user.reinforced_auth"
                :label="$t('reinforced_auth')"
                :placeholder="$t('reinforced_auth')"
                :items="[
                  { key: 0, title: $t('No') },
                  { key: 1, title: $t('Yes') },
                ]"
                item-title="title"
                item-value="key"
                :rules="[requiredValidator]"
                class="required"
                :return-object="false"
              />
            </VCol>
          </VRow>
          <VDivider class="my-5" />
          <VRow>
            <VCol
              v-for="(permission, index) in permissions.direct_permissions"
              :key="index"
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="selectedPermissions[permission.name]"
                :readonly="!isEditable"
                :label="$t(extractAction(permission.name))"
                hide-details
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VCard>
</template>

<script setup>
import {
  useCoreStore,
  usePermissionStore,
  useRoleStore,
  useUserStore,
} from "@/stores";
import { filter as _filter, map as _map, isEmpty } from "lodash";

const formElt = ref();
const avatarEl = ref();
const changedImg = ref();
const errors = ref();
const t = inject("t");
const router = useRouter();
const route = useRoute();
console.log("params", route.params);

const selectedPermissions = ref({});
const { can } = useAbility();
const permissionStore = usePermissionStore();
const { directPermissions: permissions } = storeToRefs(permissionStore);

const coreStore = useCoreStore();
const { enums } = storeToRefs(coreStore);

const roleStore = useRoleStore();
const { roles, isRolesLoading } = storeToRefs(roleStore);

const userStore = useUserStore();

const { user, isUserLoading } = storeToRefs(userStore);


const transRoles = computed(() =>
  roles.value?.map((role) => ({
    id: role.id ?? null,
    name: role.name ? t(`${role.name}`) : t('RoleModel.default'),
  })) || []
);

const hasPermission = computed(() => {
  return route.params.action == "edit" ? can("users.update") : (route.params.action == "show" ?  can("users.show") : can("users.store"));
});
definePage({
  meta: {
    navActiveLink: "settings-users",
  },
});

function changeImg(e) {
  try {
    const fileReader = new FileReader();
    const img = e.target.files[0];

    user.value.avatar = img;
    fileReader.readAsDataURL(img);
    fileReader.onload = () => {
      if (typeof fileReader.result === "string")
        changedImg.value = fileReader.result;
    };
  } catch (e) {}
}

const isSnackbarVisible = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("default");

const isEditable = computed(() =>
  ["edit", "add"].includes(route.params.action)
);

const handleRoleChange = (value) => {
  console.log("Selected role ID:", value);
  user.value.roles = value ?? null;  // Store the ID directly, or null if not selected
};

const defaultUser = {
  auth_status: "active",
  roles: null,
  email: "",
  phone: "",
  name: "",
  reinforced_auth: 0,
};


onMounted(async () => {
  if (isEmpty(roles.value)) roleStore.getRoles();
  if (isEmpty(permissions.value)) permissionStore.fetchDirectPermissions();

  switch (route.params.action) {
    case "edit":
    case "show":
      if (!route.params.user) {
        await router.push({ name: "$error", params: { error: 404 } });
      }
      await userStore.getUser(route.params.user);

      user.value.roles = user.value.roles?.length ? user.value.roles[0].id : null;
      
      _map(
        user.value.direct_permissions,
        (perm) => (selectedPermissions.value[perm.name] = true)
      );
      break;
    case "add":
      user.value = { ...defaultUser, roles: null }; 
      break;
    default:
      await router.push({ name: "$error", params: { error: 404 } });
  }
});


async function onFormSubmit() {
  errors.value = null;

  const { valid } = await formElt.value.validate();
  if (!valid) return;

  user.value.directPermissions = _filter(
    _map(selectedPermissions.value, (isTrue, per) => (isTrue ? per : "")),
    (isNotNull) => isNotNull
  );

  const { statusCode, data } = user.value.id
    ? await userStore.updateUser()
    : await userStore.addUser();

  if (statusCode == 201) {
    snackbarColor.value = "success";
    snackbarMessage.value = t("Added ok", { model: "Utilisateur" });
    isSnackbarVisible.value = true;
    redirectToList();
  } else if (statusCode == 200) {
    snackbarColor.value = "success";
    snackbarMessage.value = t("Updated ok", { model: t("Utilisateur") });
    isSnackbarVisible.value = true;
  } else if (statusCode == 422) {
    errors.value = data.errors;
    snackbarColor.value = "error";
    snackbarMessage.value = t(data.message ?? "") ?? t("please fix errors");
    isSnackbarVisible.value = true;
  } else {
    snackbarColor.value = "error";
    snackbarMessage.value = t("try again in a few seconds");
    isSnackbarVisible.value = true;
  }
}

async function redirectToList() {
  await router.push({ name: "settings-users" });
}

function extractAction(permission) {
  const parts = permission.split(".");

  return parts.length === 2 ? parts[1] : permission;
}

onBeforeUnmount(() => {
  userStore.reset("user");
});
</script>

<template>
  <div>
    <VCard
      class="mb-6"
      title="Kick start your project 🚀"
    >
      <VCardText>All the best for your new project.</VCardText>
      <VCardText>
        <div class="my-5 border py-2">
          with global function <span class="badge bg-warning rounded px-2">$can</span> :  {{ $can('users.index') }}
          <br>
          or with imported <span class="badge bg-warning rounded px-2">can</span> : {{ can('users.index') }}
        </div>
        Please make sure to read our <a
          href="https://demos.pixinvent.com/vuexy-vuejs-admin-template/documentation/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-decoration-none"
        >
          Template Documentation
        </a> to understand where to go from here and how to use our template.
      </VCardText>
    </VCard>

    <VCard title="Want to integrate JWT? 🔒">
      <VCardText>We carefully crafted JWT flow so you can implement JWT with ease and with minimum efforts.</VCardText>
      <VCardText>Please read our  JWT Documentation to get more out of JWT authentication.</VCardText>
    </VCard>
  </div>
</template>

<script setup>
definePage({
  meta: {
    // permission: 'dashboard',
    layout: 'default',
  },
})

const { can } = useAbility()
</script>

import dashboard from "./dashboard"

export default [
  ...dashboard,
  // {
  //   title: "InvPlanMd.Inventory Plan",
  //   to: { name: "inventory-plan-list" },
  //   icon: { icon: 'tabler-building-warehouse' },
  //   permission: 'inventory_plans.index',
  // },
  {
    title: "Settings",
    icon: { icon: "tabler-settings" },
    to: { name: "settings-parent" },
    permission: 'settings.index',
  },
  {
    title: "Accounts",
    icon: { icon: 'tabler-building-warehouse' },
    to: { name: "accounts-list" },
    permission: 'accounts.index',
  },
  {
    title: "Balances",
    icon: { icon: 'tabler-coin' },
    to: { name: "balance-list" },
    permission: 'balances.index',
  },
  {
    title: "bg_consolides",
    icon: { icon: 'tabler-coin' },
    to: { name: "bg-consolide-list" },
    permission: 'bg_consolides.index',
  },
  {
    title: "Inter Company st",
    icon: { icon: 'tabler-home-dollar' },
    to: { name: "inter-list" },
    permission: 'inter.index',
  },
  {
    title: "CPC",
    icon: { icon: 'tabler-abacus' },
    to: { name: "cpc-list" },
    permission: 'cpc.index',
  },
  {
    title: "bilan",
    icon: { icon: 'tabler-scale' },
    to: { name: "bilan-list" },
    permission: 'bilan.index',
  },
  {
    title: "flux-tresorerie",
    icon: { icon: 'tabler-transaction-dollar' },
    to: { name: "flux-list" },
    permission: 'flux.index',
  },
  
  {
    title: "Delai_de_paiement",
    icon: { icon: "tabler-credit-card" },
    children: [
      {
        title: 'Tous',
        to: { name: "payment-list" },
        name: 'payment-list',
        permission: 'payment_delays.index',
      },
      {
        title: 'Nouveau',
        to: { name: "payment-list-new" },
        name: 'payment-list-new',
        permission: 'payment_delays.index',
      },
    ],
  },

];

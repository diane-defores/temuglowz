<template>
  <div class="app-root">
    <header class="app-header">
      <h1>Temu Shopping Lists</h1>
      <nav>
        <RouterLink to="/">Listes</RouterLink>
        <RouterLink to="/shopping">Shopping</RouterLink>
        <RouterLink to="/import/manual">Import manuel</RouterLink>
        <RouterLink to="/sync">Synchronisation</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

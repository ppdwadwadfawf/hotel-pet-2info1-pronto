<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { cadastrarTutor } from '@/services/tutores';

const router = useRouter();
const novoTutor = ref({
  nome: '',
  telefone: '',
});
const erro = ref('');
const salvando = ref(false);

async function salvarTutor() {
  erro.value = '';
  salvando.value = true;

  try {
    await cadastrarTutor(novoTutor.value);
    await router.push({ name: 'tutores' });
  } catch (error) {
    erro.value = `Erro ao cadastrar tutor: ${error.message}`;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div>
    <header class="mb-4">
      <h1 class="h2">Cadastrar tutor</h1>
      <p class="text-body-secondary mb-0">
        Informe os dados do novo tutor.
      </p>
    </header>

    <p v-if="erro" class="alert alert-danger" role="alert">
      {{ erro }}
    </p>

    <form class="row g-3" @submit.prevent="salvarTutor">
      <div class="col-md-6">
        <label for="nome" class="form-label">Nome</label>
        <input
          id="nome"
          v-model.trim="novoTutor.nome"
          class="form-control"
          name="nome"
          autocomplete="name"
          required
        />
      </div>

      <div class="col-md-6">
        <label for="telefone" class="form-label">Telefone</label>
        <input
          id="telefone"
          v-model.trim="novoTutor.telefone"
          class="form-control"
          name="telefone"
          type="tel"
          autocomplete="tel"
          required
        />
      </div>

      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" type="submit" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
        <RouterLink class="btn btn-outline-secondary" :to="{ name: 'tutores' }">
          Cancelar
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listarTutores, removerTutor } from '@/services/tutores';

const tutores = ref([]);
const carregando = ref(true);
const erro = ref('');

async function carregarTutores() {
  carregando.value = true;
  erro.value = '';

  try {
    tutores.value = await listarTutores();
  } catch (error) {
    erro.value = `Erro ao carregar tutores: ${error.message}`;
  } finally {
    carregando.value = false;
  }
}

async function excluirTutor(id) {
  if (!window.confirm('Deseja realmente excluir este tutor?')) {
    return;
  }

  erro.value = '';

  try {
    await removerTutor(id);
    tutores.value = tutores.value.filter((tutor) => tutor.id !== id);
  } catch (error) {
    erro.value = `Erro ao excluir tutor: ${error.message}`;
  }
}

onMounted(carregarTutores);
</script>

<template>
  <div>
    <header class="mb-4">
      <h1 class="h2">Listagem de tutores</h1>
      <p class="text-body-secondary mb-0">
        Tutores cadastrados no sistema.
      </p>
    </header>

    <div class="mb-3">
      <RouterLink
        class="btn btn-primary"
        :to="{ name: 'addTutor' }"
      >
        <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
        Cadastrar tutor
      </RouterLink>
    </div>

    <p v-if="erro" class="alert alert-danger" role="alert">
      {{ erro }}
    </p>

    <p v-if="carregando" class="text-body-secondary" role="status">
      Carregando tutores...
    </p>

    <div v-else-if="tutores.length === 0" class="alert alert-info" role="status">
      Nenhum tutor cadastrado.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nome</th>
            <th scope="col">Telefone</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tutor in tutores" :key="tutor.id">
            <td>{{ tutor.id }}</td>
            <td>{{ tutor.nome }}</td>
            <td>{{ tutor.telefone }}</td>
            <td>
              <div class="d-flex flex-wrap gap-2">
                <RouterLink
                  class="btn btn-outline-primary btn-sm"
                  :to="`/tutores/${tutor.id}`"
                >
                  Visualizar
                </RouterLink>
                <button
                  class="btn btn-danger btn-sm"
                  type="button"
                  @click="excluirTutor(tutor.id)"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

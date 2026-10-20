<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { listarTutores, removerTutor } from '@/services/tutores';

const tutores = ref([]);
const pets = ref([]);
const carregando = ref(true);
const erro = ref('');
const pesquisa = ref('');

async function carregarDados() {
  carregando.value = true;
  erro.value = '';

  try {
    const [resultadoTutores, respostaPets] = await Promise.all([
      listarTutores(),
      fetch('http://localhost:3000/pets'),
    ]);

    tutores.value = resultadoTutores;
    pets.value = await respostaPets.json();
  } catch (error) {
    erro.value = `Erro ao carregar tutores: ${error.message}`;
  } finally {
    carregando.value = false;
  }
}

function petsDoTutor(tutorId) {
  return pets.value.filter((pet) => String(pet.tutorId) === String(tutorId));
}

function nomesDosPets(tutorId) {
  const petsVinculados = petsDoTutor(tutorId);

  if (petsVinculados.length === 0) {
    return 'Nenhum pet vinculado';
  }

  return petsVinculados.map((pet) => pet.nome).join(' / ');
}

async function excluirTutor(id) {
  const tutor = tutores.value.find((item) => String(item.id) === String(id));
  const petsVinculados = petsDoTutor(id);

  if (petsVinculados.length > 0) {
    erro.value = `O tutor ${tutor?.nome ?? 'selecionado'} ainda possui pets vinculados. Remova ou transfira os pets antes de excluir.`;
    return;
  }

  const confirmar = window.confirm('Deseja realmente remover este tutor?');

  if (!confirmar) {
    return;
  }

  erro.value = '';

  try {
    await removerTutor(id);
    tutores.value = tutores.value.filter((tutorAtual) => String(tutorAtual.id) !== String(id));
  } catch (error) {
    erro.value = `Erro ao excluir tutor: ${error.message}`;
  }
}

const tutoresFiltrados = computed(() => {
  const termo = pesquisa.value.trim().toLowerCase();

  if (!termo) {
    return tutores.value;
  }

  return tutores.value.filter((tutor) => {
    const textos = [
      tutor.nome,
      tutor.telefone,
      tutor.email ?? '',
      tutor.cpfCnpj ?? '',
    ].join(' ').toLowerCase();

    return textos.includes(termo);
  });
});

onMounted(carregarDados);
</script>

<template>
  <div>
    <header class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h2 mb-1">Listagem de Tutores</h1>
        <p class="text-body-secondary mb-0">Consulte os tutores cadastrados e seus pets.</p>
      </div>

      <RouterLink class="btn btn-primary" :to="{ name: 'addTutor' }">
        <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
        Cadastrar Tutor
      </RouterLink>
    </header>

    <div class="mb-4">
      <div class="input-group">
        <span class="input-group-text bg-white">
          <i class="bi bi-search" aria-hidden="true"></i>
        </span>
        <input
          v-model="pesquisa"
          class="form-control"
          type="search"
          placeholder="Pesquisar tutor por nome, CPF/CNPJ ou e-mail"
          aria-label="Pesquisar tutor"
        />
      </div>
    </div>

    <p v-if="erro" class="alert alert-danger" role="alert">{{ erro }}</p>

    <p v-if="carregando" class="text-body-secondary" role="status">Carregando tutores...</p>

    <div v-else-if="tutoresFiltrados.length === 0" class="alert alert-info" role="status">
      Nenhum tutor cadastrado.
    </div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nome Completo</th>
            <th scope="col">CPF / CNPJ</th>
            <th scope="col">Telefone / Celular / WhatsApp</th>
            <th scope="col">E-mail</th>
            <th scope="col">Pets (Quantidade)</th>
            <th scope="col">Nomes dos Pets</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="tutor in tutoresFiltrados" :key="tutor.id">
            <td>{{ tutor.id }}</td>
            <td>{{ tutor.nome }}</td>
            <td>{{ tutor.cpfCnpj || '—' }}</td>
            <td>{{ tutor.telefone || '—' }}</td>
            <td>{{ tutor.email || '—' }}</td>
            <td>{{ petsDoTutor(tutor.id).length }}</td>
            <td>{{ nomesDosPets(tutor.id) }}</td>
            <td>
              <div class="d-flex flex-wrap gap-2">
                <RouterLink class="btn btn-outline-primary btn-sm" :to="`/tutores/${tutor.id}`">
                  Visualizar
                </RouterLink>
                <button class="btn btn-outline-danger btn-sm" type="button" @click="excluirTutor(tutor.id)">
                  Remover
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

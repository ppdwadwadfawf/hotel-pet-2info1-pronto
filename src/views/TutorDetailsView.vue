<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { buscarTutor, removerTutor } from '@/services/tutores';

const route = useRoute();
const router = useRouter();
const tutor = ref(null);
const pets = ref([]);
const carregando = ref(true);
const erro = ref('');
const erroPet = ref('');
const salvandoPet = ref(false);

const novoPet = ref({
  nome: '',
  especie: '',
  tutorId: '',
});

const petsDoTutor = computed(() => {
  return pets.value.filter((pet) => String(pet.tutorId) === String(route.params.id));
});

async function carregarDados() {
  carregando.value = true;
  erro.value = '';

  try {
    const [tutorCarregado, petsCarregados] = await Promise.all([
      buscarTutor(route.params.id),
      fetch(`http://localhost:3000/pets?tutorId=${route.params.id}`),
    ]);

    tutor.value = tutorCarregado;
    pets.value = await petsCarregados.json();
    novoPet.value.tutorId = String(route.params.id);
  } catch (error) {
    erro.value = `Erro ao carregar tutor: ${error.message}`;
  } finally {
    carregando.value = false;
  }
}

async function removerTutorAtual() {
  if (!tutor.value) {
    return;
  }

  if (petsDoTutor.value.length > 0) {
    erro.value = 'Antes de remover o tutor, remova ou transfira os pets vinculados.';
    return;
  }

  const confirmar = window.confirm('Deseja realmente remover este tutor?');

  if (!confirmar) {
    return;
  }

  try {
    await removerTutor(tutor.value.id);
    await router.push({ name: 'tutores' });
  } catch (error) {
    erro.value = `Erro ao remover tutor: ${error.message}`;
  }
}

async function salvarPet() {
  const nome = novoPet.value.nome.trim();
  const especie = novoPet.value.especie.trim();

  if (!nome || !especie) {
    erroPet.value = 'Informe o nome e a espécie do pet.';
    return;
  }

  salvandoPet.value = true;
  erroPet.value = '';

  try {
    const resposta = await fetch('http://localhost:3000/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome,
        especie,
        tutorId: String(route.params.id),
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Não foi possível cadastrar o pet (${resposta.status}).`);
    }

    novoPet.value = {
      nome: '',
      especie: '',
      tutorId: String(route.params.id),
    };

    await carregarDados();
  } catch (error) {
    erroPet.value = error.message;
  } finally {
    salvandoPet.value = false;
  }
}

watch(
  () => route.params.id,
  () => {
    carregarDados();
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <header class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <h1 class="h2 mb-1">Detalhes do Tutor</h1>
        <p class="text-body-secondary mb-0">Visualize os dados do tutor e seus pets vinculados.</p>
      </div>

      <RouterLink class="btn btn-outline-primary" :to="{ name: 'tutores' }">
        <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
        Voltar para tutores
      </RouterLink>
    </header>

    <p v-if="carregando" class="text-body-secondary" role="status">Carregando tutor...</p>

    <p v-else-if="erro" class="alert alert-danger" role="alert">{{ erro }}</p>

    <template v-else>
      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body p-0">
          <div class="border-bottom px-3 py-3 bg-light-subtle">
            <h2 class="h4 mb-0">Dados do Tutor</h2>
          </div>

          <div class="row g-3 px-3 py-3">
            <div class="col-md-4">
              <span class="text-body-secondary d-block">ID</span>
              <strong>{{ tutor.id }}</strong>
            </div>
            <div class="col-md-4">
              <span class="text-body-secondary d-block">Nome Completo</span>
              <strong>{{ tutor.nome }}</strong>
            </div>
            <div class="col-md-4">
              <span class="text-body-secondary d-block">Telefone / Celular / WhatsApp</span>
              <strong>{{ tutor.telefone || '—' }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="card border-0 shadow-sm mb-4">
        <div class="card-body p-0">
          <div class="border-bottom px-3 py-3 bg-light-subtle d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 class="h4 mb-0">Pets vinculados</h2>
            <span class="badge bg-primary rounded-pill">{{ petsDoTutor.length }} pets</span>
          </div>

          <div class="p-3">
            <div v-if="petsDoTutor.length === 0" class="alert alert-info mb-0" role="status">
              Nenhum pet vinculado a este tutor.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Espécie</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="pet in petsDoTutor" :key="pet.id">
                    <td>{{ pet.id }}</td>
                    <td>{{ pet.nome }}</td>
                    <td>{{ pet.especie }}</td>
                    <td>
                      <RouterLink class="btn btn-outline-primary btn-sm" :to="`/pets/${pet.id}`">
                        Visualizar pet
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section class="card border-0 shadow-sm mb-3">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Cadastrar novo pet</h3>

          <p v-if="erroPet" class="alert alert-danger" role="alert">{{ erroPet }}</p>

          <form class="row g-3" @submit.prevent="salvarPet">
            <div class="col-md-6">
              <label class="form-label" for="novoPetNome">Nome do pet</label>
              <input id="novoPetNome" v-model="novoPet.nome" class="form-control" type="text" placeholder="Digite o nome do pet" required />
            </div>

            <div class="col-md-4">
              <label class="form-label" for="novoPetEspecie">Espécie</label>
              <select id="novoPetEspecie" v-model="novoPet.especie" class="form-select" required>
                <option value="" disabled>Selecione</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>

            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-success w-100" type="submit" :disabled="salvandoPet">
                {{ salvandoPet ? 'Salvando...' : 'Cadastrar pet' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <button class="btn btn-outline-danger" type="button" @click="removerTutorAtual">
        Remover Tutor
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { cadastrarTutor } from '@/services/tutores';

const router = useRouter();

const form = ref({
  nome: '',
  telefone: '',
  cpfCnpj: '',
  email: '',
  dataNascimento: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

const mensagensErro = ref({
  nome: '',
  telefone: '',
});

const salvando = ref(false);

const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function limparDigitos(valor = '') {
  return valor.replace(/\D/g, '');
}

function formatarTelefone(valor = '') {
  const digits = limparDigitos(valor).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatarCpfCnpj(valor = '') {
  const digits = limparDigitos(valor).slice(0, 14);

  if (digits.length <= 11) {
    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatarCep(valor = '') {
  const digits = limparDigitos(valor).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function validarNome() {
  if (!form.value.nome.trim()) {
    mensagensErro.value.nome = 'Ops, campo obrigatório, por favor preencha-o!';
    return false;
  }

  mensagensErro.value.nome = '';
  return true;
}

function validarTelefone() {
  const digits = limparDigitos(form.value.telefone);

  if (digits.length < 10) {
    mensagensErro.value.telefone = 'Ops, campo obrigatório, por favor preencha-o!';
    return false;
  }

  mensagensErro.value.telefone = '';
  return true;
}

const formularioValido = computed(
  () => form.value.nome.trim().length > 0 && limparDigitos(form.value.telefone).length >= 10,
);

function atualizarTelefone(evento) {
  form.value.telefone = formatarTelefone(evento.target.value);
  validarTelefone();
}

function atualizarCpfCnpj(evento) {
  form.value.cpfCnpj = formatarCpfCnpj(evento.target.value);
}

function atualizarCep(evento) {
  form.value.cep = formatarCep(evento.target.value);
}

function atualizarEmail(evento) {
  form.value.email = evento.target.value.trim();
}

function aplicarValidacoes() {
  const nomeValido = validarNome();
  const telefoneValido = validarTelefone();

  return nomeValido && telefoneValido;
}

async function salvarTutor() {
  if (!aplicarValidacoes()) {
    return;
  }

  salvando.value = true;

  try {
    await cadastrarTutor({
      nome: form.value.nome.trim(),
      telefone: limparDigitos(form.value.telefone),
      cpfCnpj: limparDigitos(form.value.cpfCnpj) || '',
      email: form.value.email || '',
      dataNascimento: form.value.dataNascimento || '',
      rua: form.value.rua || '',
      numero: form.value.numero || '',
      bairro: form.value.bairro || '',
      cidade: form.value.cidade || '',
      estado: form.value.estado || '',
      cep: limparDigitos(form.value.cep) || '',
    });

    await router.push({ name: 'tutores' });
  } catch (error) {
    mensagensErro.value.telefone = `Erro ao cadastrar tutor: ${error.message}`;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div>
    <header class="mb-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div>
        <h1 class="h2 mb-1">Cadastrar Tutor</h1>
        <p class="text-body-secondary mb-0">Preencha os dados para cadastrar um novo tutor.</p>
      </div>

      <RouterLink class="btn btn-outline-primary" :to="{ name: 'tutores' }">
        <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
        Voltar para tutores
      </RouterLink>
    </header>

    <form class="card border-0 shadow-sm" @submit.prevent="salvarTutor">
      <div class="card-body p-4">
        <div class="border-bottom pb-3 mb-4">
          <h2 class="h4 mb-0">Dados do Tutor</h2>
        </div>

        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label" for="nome">Nome Completo</label>
            <input
              id="nome"
              v-model="form.nome"
              class="form-control"
              :class="{ 'is-invalid': mensagensErro.nome }"
              type="text"
              placeholder="Digite o nome completo"
              @blur="validarNome"
            />
            <div v-if="mensagensErro.nome" class="invalid-feedback d-block mt-2">
              {{ mensagensErro.nome }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label" for="telefone">Telefone / Celular / WhatsApp</label>
            <input
              id="telefone"
              :value="form.telefone"
              class="form-control"
              :class="{ 'is-invalid': mensagensErro.telefone }"
              type="tel"
              placeholder="(00) 00000-0000"
              @input="atualizarTelefone"
              @blur="validarTelefone"
            />
            <div v-if="mensagensErro.telefone" class="invalid-feedback d-block mt-2">
              {{ mensagensErro.telefone }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label" for="cpfCnpj">CPF / CNPJ</label>
            <input
              id="cpfCnpj"
              :value="form.cpfCnpj"
              class="form-control"
              type="text"
              placeholder="Digite o CPF ou CNPJ"
              @input="atualizarCpfCnpj"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="email">E-mail</label>
            <input
              id="email"
              :value="form.email"
              class="form-control"
              type="email"
              placeholder="nome@exemplo.com"
              @input="atualizarEmail"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="dataNascimento">Data de nascimento</label>
            <input id="dataNascimento" v-model="form.dataNascimento" class="form-control" type="date" />
          </div>
        </div>

        <div class="border-bottom pb-3 mt-5 mb-4">
          <h2 class="h4 mb-0">Endereço</h2>
        </div>

        <div class="row g-4">
          <div class="col-md-6">
            <label class="form-label" for="rua">Rua</label>
            <input id="rua" v-model="form.rua" class="form-control" type="text" placeholder="Digite o nome da rua" />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="numero">Número</label>
            <input id="numero" v-model="form.numero" class="form-control" type="text" placeholder="Número" />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="bairro">Bairro</label>
            <input id="bairro" v-model="form.bairro" class="form-control" type="text" placeholder="Digite o bairro" />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="cidade">Cidade</label>
            <input id="cidade" v-model="form.cidade" class="form-control" type="text" placeholder="Digite a cidade" />
          </div>

          <div class="col-md-6">
            <label class="form-label" for="estado">Estado</label>
            <select id="estado" v-model="form.estado" class="form-select">
              <option value="">Selecione</option>
              <option v-for="estado in estados" :key="estado" :value="estado">
                {{ estado }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label" for="cep">CEP</label>
            <input
              id="cep"
              :value="form.cep"
              class="form-control"
              type="text"
              placeholder="00000-000"
              @input="atualizarCep"
            />
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <RouterLink class="btn btn-outline-secondary" :to="{ name: 'tutores' }">Cancelar</RouterLink>
          <button class="btn btn-primary" type="submit" :disabled="salvando || !formularioValido">
            {{ salvando ? 'Salvando...' : 'Cadastrar Tutor' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

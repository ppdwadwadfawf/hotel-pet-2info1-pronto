<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const API_URL = 'http://localhost:3000';

const pet = ref({});
const tutor = ref({});

async function carregarPet() {
    const idPet = route.params.id;
    console.log('ID do Pet:', idPet);

    const respostaPet = await fetch(`${API_URL}/pets/${idPet}`);
    pet.value = await respostaPet.json();

    const respostaTutor = await fetch(`${API_URL}/tutores/${pet.value.tutorId}`);
    tutor.value = await respostaTutor.json();
}

onMounted(carregarPet);
</script>

<template>
<h1>Nome do pet: {{ pet.nome }}</h1>
<p>Especie: {{ pet.especie }}</p>
<p>Nome do Tutor: {{ tutor.nome }}</p>

<button class="btn btn-primary">
    <RouterLink :to="{name: 'pets'}">Voltar</RouterLink>
</button>

</template>
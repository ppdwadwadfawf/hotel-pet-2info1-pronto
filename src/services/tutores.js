const API_URL = 'http://localhost:3000/tutores';

async function requestTutores(path = '', options) {
  const resposta = await fetch(`${API_URL}${path}`, options);

  if (!resposta.ok) {
    throw new Error(`Não foi possível concluir a operação (${resposta.status}).`);
  }

  if (options?.method === 'DELETE' || resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

export function listarTutores() {
  return requestTutores();
}

export function buscarTutor(id) {
  return requestTutores(`/${encodeURIComponent(id)}`);
}

export function cadastrarTutor(tutor) {
  return requestTutores('', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tutor),
  });
}

export function removerTutor(id) {
  return requestTutores(`/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

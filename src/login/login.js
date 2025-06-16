// login.js
// Este script lida com a lógica de autenticação do usuário na página de login.
// Ele captura os dados do formulário de login, envia para o servidor e 
// redireciona o usuário com base no sucesso do login e no tipo de usuário.

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // Previne o comportamento padrão de envio do formulário

  // Obtém os valores dos campos de email e senha
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    // Envia uma requisição POST para o endpoint /login do servidor
    const resposta = await fetch("http://localhost:3333/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Define o tipo de conteúdo como JSON
      body: JSON.stringify({ email, senha }), // Converte os dados para JSON
    });

    const dados = await resposta.json(); // Parseia a resposta JSON do servidor

    // Verifica se a resposta foi bem-sucedida e se há dados do usuário
    if (resposta.ok && dados.usuario) {
      // Salva o objeto completo do usuário no localStorage para uso posterior
      localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

      // Salva apenas o ID do usuário no localStorage para facilitar referências
      localStorage.setItem("userId", dados.usuario.id);

      // Redireciona o usuário com base no seu tipo (clube ou atleta)
      if (dados.usuario.type === "clube") {
        window.location.href = "perfil/perfil-clube.html"; // Redireciona para o perfil do clube
      } else {
        window.location.href = "../perfil/perfil-atleta.html"; // Redireciona para o perfil do atleta
      }
    } else {
      // Exibe uma mensagem de erro se o login falhar
      document.getElementById("mensagem").textContent = dados.erro || "Erro no login.";
    }
  } catch (erro) {
    // Captura e exibe erros de conexão com o servidor
    document.getElementById("mensagem").textContent = "Erro ao conectar com o servidor.";
    console.error(erro);
  }
});

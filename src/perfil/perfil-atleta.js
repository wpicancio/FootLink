// perfil-atleta.js
document.addEventListener("DOMContentLoaded", () => {
    let isPosting = false;

    // Elementos do DOM
    const postForm = document.getElementById("post-form");
    const postText = document.getElementById("post-text");
    const postImageInput = document.getElementById("post-image-upload");
    const postVideoInput = document.getElementById("post-video-upload");
    const feedPosts = document.getElementById("feed-posts");

    const nomeAtleta = document.getElementById("nomeAtleta");
    const bioAtleta = document.getElementById("bioAtleta");
    const profileAvatar = document.getElementById("profile-avatarrr");
    const avatarUpload = document.getElementById("avatar-upload");
    const editBtn = document.querySelector(".edit-profile-btn");
    const logoutBtn = document.getElementById("logout-btn");

    let editing = false;

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuario) {
        nomeAtleta.textContent = usuario.name || "";
        bioAtleta.textContent = usuario.bio || "Escreva algo sobre você!";
        profileAvatar.src = usuario.foto || "images/player_placeholder.jpg";

        if (usuario.publicacoes && usuario.publicacoes.length > 0) {
            const initialMessage = feedPosts.querySelector(".initial-message");
            if (initialMessage) initialMessage.remove();

            usuario.publicacoes
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .forEach(pub => createPostElement(pub));
        }
    }

    // Editar perfil
    editBtn.addEventListener("click", () => {
        if (!editing) {
            const nome = nomeAtleta.textContent;
            const bio = bioAtleta.textContent;

            nomeAtleta.innerHTML = `<input type="text" id="edit-nome" value="${nome}">`;
            bioAtleta.innerHTML = `<textarea id="edit-bio" placeholder="Diga algo sobre você!">${bio}</textarea>`;

            editBtn.innerHTML = `<i class="fas fa-save"></i> Salvar Perfil`;
            editing = true;
        } else {
            const novoNome = document.getElementById("edit-nome").value.trim();
            const novaBio = document.getElementById("edit-bio").value.trim();

            nomeAtleta.textContent = novoNome || nomeAtleta.textContent;
            bioAtleta.textContent = novaBio || bioAtleta.textContent;

            const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
            usuario.name = novoNome;
            usuario.bio = novaBio;
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

            editBtn.innerHTML = `<i class="fas fa-edit"></i> Editar Perfil`;
            editing = false;
        }
    });

    // Atualizar foto
    avatarUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        const userId = localStorage.getItem("userId");

        if (!file || !userId) {
            alert("Erro: selecione uma imagem e certifique-se de estar logado.");
            return;
        }

        const formData = new FormData();
        formData.append("foto", file);
        formData.append("userId", userId);

        try {
            const originalEditBtnHTML = editBtn.innerHTML;
            editBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            editBtn.disabled = true;

            const response = await fetch("http://localhost:3333/upload-foto", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Erro no upload");

            profileAvatar.src = data.caminho;

            const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
            usuario.foto = data.caminho;
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

            alert("Foto atualizada com sucesso!");

        } catch (err) {
            console.error("Erro:", err);
            alert(err.message || "Falha ao atualizar foto");
        } finally {
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
            editBtn.disabled = false;
            event.target.value = "";
        }
    });

    // Publicar postagem
    postForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isPosting) return;
        isPosting = true;

        const texto = postText.value.trim();
        const imagem = postImageInput.files[0];
        const video = postVideoInput.files[0];
        const userId = localStorage.getItem("userId");

        if (!texto && !imagem && !video) {
            alert("Adicione texto ou mídia para publicar.");
            isPosting = false;
            return;
        }

        const submitBtn = postForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("texto", texto);

            if (imagem) {
                formData.append("midia", imagem);
                formData.append("tipo", "imagem");
            } else if (video) {
                formData.append("midia", video);
                formData.append("tipo", "video");
            }

            const response = await fetch("http://localhost:3333/publicar-midia", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Erro ao publicar");

            if (data.success) {
                localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));

                const initialMessage = feedPosts.querySelector(".initial-message");
                if (initialMessage) initialMessage.remove();

                createPostElement(data.publicacao, true);

                postText.value = "";
                postImageInput.value = "";
                postVideoInput.value = "";
            }

        } catch (error) {
            console.error("Erro:", error);
            alert(error.message || "Erro ao publicar conteúdo");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            isPosting = false;
        }
    });

    // Logout
    logoutBtn.addEventListener("click", () => {
        if (confirm("Deseja realmente sair?")) {
            localStorage.removeItem("usuarioLogado");
            localStorage.removeItem("userId");
            window.location.href = "/index.html";
        }
    });

    // Tema
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.setAttribute("data-theme", savedTheme);
        themeIcon.className = savedTheme === "light" ? "fas fa-sun" : "fas fa-moon";
    }

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "" : "light";

        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        themeIcon.className = newTheme === "light" ? "fas fa-sun" : "fas fa-moon";
    });

    // Excluir publicação
    document.addEventListener("click", async (e) => {
        if (e.target.closest(".btn-excluir")) {
            const postEl = e.target.closest(".post-card");
            const postId = postEl.dataset.postId;
            const userId = localStorage.getItem("userId");

            if (confirm("Tem certeza que deseja excluir esta publicação?")) {
                try {
                    const response = await fetch(`http://localhost:3333/excluir-publicacao/${userId}/${postId}`, {
                        method: "DELETE"
                    });

                    const data = await response.json();

                if (data.success) {
                    postEl.remove();

                    // 🟢 Atualiza o localStorage para refletir a exclusão
                    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
                    usuario.publicacoes = usuario.publicacoes.filter(pub => pub.id !== postId);
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
                    
                } else {
                    alert("Erro ao excluir publicação.");
                }
                } catch (err) {
                    console.error(err);
                    alert("Erro ao comunicar com o servidor.");
                }
            }
        }
    });

    // Função para criar elemento de post
    function createPostElement(pub, prepend = false) {
        const post = document.createElement("div");
        post.classList.add("post-card");
        post.dataset.postId = pub.id;

        // Cabeçalho
        const postHeader = document.createElement("div");
        postHeader.classList.add("post-header");
        postHeader.innerHTML = `
            <img src="${usuario.foto || 'images/player_placeholder.jpg'}" 
                 alt="Avatar" 
                 class="post-avatar"
                 onerror="this.src='images/player_placeholder.jpg'">
            <div class="post-author-info">
                <span class="post-author">${usuario.name || 'Usuário'}</span>
                <span class="post-time">${formatDate(pub.data)}</span>
            </div>
            <button class="btn-excluir"><i class="fas fa-trash"></i></button>
        `;

        // Corpo
        const postBody = document.createElement("div");
        postBody.classList.add("post-body");

        if (pub.texto) {
            const textElement = document.createElement("p");
            textElement.textContent = pub.texto;
            postBody.appendChild(textElement);
        }

        // Mídia
        if (pub.midia && pub.tipoMidia) {
            const mediaContainer = document.createElement("div");
            mediaContainer.classList.add("media-container");

            const mediaUrl = pub.midia.startsWith('http') ? pub.midia : `http://localhost:3333${pub.midia}`;

            if (pub.tipoMidia === "imagem") {
                const img = document.createElement("img");
                img.src = mediaUrl;
                img.classList.add("post-media");
                img.alt = "Imagem da publicação";
                img.loading = "lazy";
                img.onerror = () => {
                    img.src = "images/image_placeholder.jpg";
                };
                mediaContainer.appendChild(img);
            } else if (pub.tipoMidia === "video") {
                const video = document.createElement("video");
                video.src = mediaUrl;
                video.controls = true;
                video.classList.add("post-media");
                mediaContainer.appendChild(video);
            }

            postBody.appendChild(mediaContainer);
        }

        post.appendChild(postHeader);
        post.appendChild(postBody);

        if (prepend) {
            feedPosts.prepend(post);
        } else {
            feedPosts.appendChild(post);
        }

        return post;
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});

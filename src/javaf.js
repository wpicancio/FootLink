// javaf.js
// Este script JavaScript lida com a interatividade geral do site FOOTLINK,
// incluindo navegação entre seções, funcionalidades de formulário, 
// menu mobile, alternância de tema e efeitos de carregamento.

$(document).ready(function() {
    // --- Função para Exibir Seções --- //
    // showSection(sectionId): Esconde todas as seções e exibe a seção especificada com um efeito de fade-in.
    // Também atualiza a classe 'active' nos links de navegação.
    function showSection(sectionId) {
        // Garante que todas as seções estejam ocultas
        $("section").addClass("hidden"); 
        // Exibe a seção alvo com um efeito de fade-in
        $("#" + sectionId).removeClass("hidden").addClass("fade-in");

        // Remove a classe fade-in após a animação para permitir animações repetidas
        setTimeout(() => {
            $("#" + sectionId).removeClass("fade-in");
        }, 500); // Deve corresponder à duração da animação fade-in no CSS

        // Atualiza a classe ativa nos links de navegação para feedback visual
        $(".nav-link").removeClass("active");
        const $targetLink = $(`nav ul li a[data-section="${sectionId}"]`);
        
        if ($targetLink.length) {
            $targetLink.addClass("active");
            // Se for um item de dropdown, também ativa o link principal pai
            if ($targetLink.closest(".dropdown-menu").length) {
                $targetLink.closest(".nav-item").children(".nav-link").addClass("active");
            }
        }
    }

    // --- Manipulação de Cliques em Links de Navegação --- //
    // Usa delegação de eventos para lidar com cliques em links de navegação (principais e dropdowns).
    // Previne o comportamento padrão do link e chama showSection para exibir a seção correspondente.
    $(document).on("click", "nav ul li a[data-section], footer ul li a[data-section]", function(event) {
        event.preventDefault(); // Previne o comportamento padrão do link
        const sectionId = $(this).data("section"); // Obtém o ID da seção do atributo data-section

        if (sectionId) { // Procede apenas se um data-section estiver definido
            // Esconde o menu mobile após clicar em um link
            if ($("#nav-menu").hasClass("active")) {
                $("#nav-menu").removeClass("active");
                $("#mobile-menu-toggle").removeClass("active");
            }

            // Exibe imediatamente a seção e atualiza o estado ativo
            showSection(sectionId);

            // Rola para a seção alvo com uma animação mais rápida
            $("html, body").stop().animate({ // .stop() previne o enfileiramento de animações
                scrollTop: $("#" + sectionId).offset().top - ($("#main-header").outerHeight() || 0) // Ajusta para o cabeçalho fixo
            }, 400); // Duração reduzida para 400ms
        }
    });

    // --- Manipulação de Cliques em Botões que Acionam Mudanças de Seção --- //
    // Lida com cliques em botões que possuem o atributo data-section (ex: "Começar Agora").
    $(document).on("click", ".btn[data-section]", function() { // Usa delegação de eventos
        const sectionId = $(this).data("section");
        if (sectionId) {
            showSection(sectionId);
            $("html, body").stop().animate({
                scrollTop: $("#" + sectionId).offset().top - ($("#main-header").outerHeight() || 0)
            }, 400);
        }
    });

    // --- Envio do Formulário de Registro --- //
    // Lida com o envio do formulário de registro, enviando os dados para o servidor via AJAX.
    $("#registration-form").on("submit", function(event) {
        event.preventDefault();
        
        const formData = {
            registrationType: $("#reg-type").val(),
            fullName: $("#reg-name").val(),
            username: $("#reg-username").val(),
            email: $("#reg-email").val(),
            password: $("#reg-password").val(),
            confirmPassword: $("#reg-confirm-password").val()
        };

        // Mostra um spinner de carregamento no botão de envio
        const submitBtn = $(this).find("button[type='submit']");
        submitBtn.html("<div class='mini-loading-spinner'></div> Processando...").prop("disabled", true);

        // Envia os dados para o servidor via AJAX
        $.ajax({
            url: "/register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function(response) {
                if (response.success) {
                    alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${response.user.name}`);
                    $("#registration-form")[0].reset(); // Reseta o formulário
                    
                   window.location.href = "login/login.html";
                } else {
                    alert(response.message);
                }
            },
            error: function(xhr) {
                const errorMsg = xhr.responseJSON?.message || "Erro ao conectar com o servidor";
                alert(errorMsg);
            },
            complete: function() {
                // Restaura o botão de envio após a conclusão da requisição
                submitBtn.html("<i class='fas fa-user-plus'></i> Registrar").prop("disabled", false);
            }
        });
    });

    // --- Envio do Formulário de Perfil do Representante --- //
    // Lida com o envio do formulário de perfil do representante (atualmente apenas exibe um alerta).
    $("#representative-profile-form").on("submit", function(event) {
        event.preventDefault();
        alert("Perfil do Representante atualizado com sucesso!");
        $(this)[0].reset();
    });

    // --- Envio do Formulário de Feedback --- //
    // Lida com o envio do formulário de feedback (atualmente apenas exibe um alerta).
    $("#feedback-form").on("submit", function(event) {
        event.preventDefault();
        alert("Feedback enviado com sucesso! Obrigado pela sua avaliação.");
        $(this)[0].reset(); // Reseta os campos do formulário
    });

    // --- Exibição da Seção Inicial --- //
    // Verifica se há um hash na URL para carregar uma seção específica ou exibe a seção 'home' por padrão.
    const initialSection = window.location.hash ? window.location.hash.substring(1) : "home";
    showSection(initialSection);

    // --- Alternar Menu Mobile --- //
    // Lida com a abertura e fechamento do menu de navegação mobile.
    $("#mobile-menu-toggle").on("click", function() {
        $("#nav-menu").toggleClass("active");
        $(this).toggleClass("active");
        // Previne o scroll do body quando o menu mobile está aberto
        $("body").toggleClass("no-scroll"); 
    });

    // --- Esconder Menu Mobile ao Clicar Fora --- //
    // Esconde o menu mobile se o usuário clicar fora da área do menu.
    $(document).on("click", function(event) {
        if (!$(event.target).closest(".main-nav").length && !$(event.target).closest("#mobile-menu-toggle").length) {
            if ($("#nav-menu").hasClass("active")) {
                $("#nav-menu").removeClass("active");
                $("#mobile-menu-toggle").removeClass("active");
                $("body").removeClass("no-scroll");
            }
        }
    });

    // --- Funcionalidade de Alternância de Tema --- //
    // Alterna entre o tema claro e escuro e salva a preferência no localStorage.
    $("#theme-toggle").on("click", function() {
        let currentTheme = $("body").attr("data-theme");
        let newTheme = currentTheme === "light" ? "" : "light"; // Alterna entre claro e escuro (padrão é vazio)
        $("body").attr("data-theme", newTheme);
        localStorage.setItem("theme", newTheme); // Salva a preferência do tema

        const icon = $("#theme-icon");
        if (newTheme === "light") {
            icon.removeClass("fa-moon").addClass("fa-sun");
        } else {
            icon.removeClass("fa-sun").addClass("fa-moon");
        }
    });

    // --- Efeito de Scroll no Cabeçalho --- //
    // Adiciona uma classe ao cabeçalho quando a página é rolada para baixo.
    $(window).on("scroll", function() {
        if ($(this).scrollTop() > 50) {
            $("#main-header").addClass("scrolled");
        } else {
            $("#main-header").removeClass("scrolled");
        }
    });

    // --- Funcionalidade da Tela de Carregamento --- //
    // Esconde a tela de carregamento quando a página é totalmente carregada.
    $(window).on("load", function() {
        $("#loading-screen").fadeOut("slow", function() {
            $(this).remove();
        });
    });
});

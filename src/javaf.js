$(document).ready(function() {
    // Function to show a specific section and hide others
    function showSection(sectionId) {
        // Ensure all sections are hidden
        $('section').addClass('hidden'); 
        // Show the target section with a fade-in effect
        $('#' + sectionId).removeClass('hidden').addClass('fade-in');

        // Remove fade-in class after animation to allow repeated animations
        setTimeout(() => {
            $('#' + sectionId).removeClass('fade-in');
        }, 500); // Match this to your fade-in animation duration

        // Update active class on nav links immediately for visual feedback
        $('.nav-link').removeClass('active');
        const $targetLink = $(`nav ul li a[data-section="${sectionId}"]`);
        
        if ($targetLink.length) {
            $targetLink.addClass('active');
            // If it's a dropdown item, also activate its parent main link
            if ($targetLink.closest('.dropdown-menu').length) {
                $targetLink.closest('.nav-item').children('.nav-link').addClass('active');
            }
        }
    }

    // Handle clicks for all navigation links (main and dropdowns)
    // Use event delegation for more robust handling, especially for dynamically added elements
    $(document).on('click', 'nav ul li a[data-section], footer ul li a[data-section]', function(event) {
        event.preventDefault(); // Prevent default link behavior
        const sectionId = $(this).data('section'); // Get section ID from data-section attribute

        if (sectionId) { // Only proceed if a data-section is defined
            // Hide mobile menu after clicking a link
            if ($('#nav-menu').hasClass('active')) {
                $('#nav-menu').removeClass('active');
                $('#mobile-menu-toggle').removeClass('active');
            }

            // Immediately show the section and update active state
            showSection(sectionId);

            // Scroll to the target section with a faster animation
            $('html, body').stop().animate({ // .stop() prevents queuing animations
                scrollTop: $('#' + sectionId).offset().top - ($('#main-header').outerHeight() || 0) // Adjust for fixed header
            }, 400); // Reduced duration to 400ms (from 800ms) for "rapinamente"
        }
    });

    // Handle clicks for buttons that trigger section changes (e.g., "Começar Agora")
    $(document).on('click', '.btn[data-section]', function() { // Use event delegation
        const sectionId = $(this).data('section');
        if (sectionId) {
            showSection(sectionId);
            $('html, body').stop().animate({
                scrollTop: $('#' + sectionId).offset().top - ($('#main-header').outerHeight() || 0)
            }, 400);
        }
    });

    // Form submission for generic registration form (if exists)
    /*$('#registration-form').on('submit', function(event) {
        event.preventDefault();
        alert('Cadastro enviado com sucesso!');
        $(this)[0].reset(); 
    });*/

    // Atualização no javaf.js (dentro do $(document).ready())
$('#registration-form').on('submit', function(event) {
    event.preventDefault();
    
    const formData = {
        registrationType: $('#reg-type').val(),
        fullName: $('#reg-name').val(),
        email: $('#reg-email').val(),
        password: $('#reg-password').val(),
        confirmPassword: $('#reg-confirm-password').val()
    };

    // Mostrar loading
    const submitBtn = $(this).find('button[type="submit"]');
    submitBtn.html('<div class="mini-loading-spinner"></div> Processando...').prop('disabled', true);

    // Enviar para o servidor
    $.ajax({
        url: '/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${response.user.name}`);
                $('#registration-form')[0].reset();
                
                // Redirecionar conforme o tipo de usuário
                if (formData.registrationType === 'player') {
                    showSection('atletas');
                } else {
                    showSection('cartolas-apresentacao');
                }
            } else {
                alert(response.message);
            }
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON?.message || 'Erro ao conectar com o servidor';
            alert(errorMsg);
        },
        complete: function() {
            submitBtn.html('<i class="fas fa-user-plus"></i> Registrar').prop('disabled', false);
        }
    });
});

    // Form submission for representative profile form (if exists)
    $('#representative-profile-form').on('submit', function(event) {
        event.preventDefault();
        alert('Perfil do Representante atualizado com sucesso!');
        $(this)[0].reset();
    });

    // Form submission for feedback-form
    $('#feedback-form').on('submit', function(event) {
        event.preventDefault();
        alert('Feedback enviado com sucesso! Obrigado pela sua avaliação.');
        $(this)[0].reset(); // Reset the form fields
    });

    // Function to show players based on position
    function showPlayers(position) {
        const $videosContainer = $('#videos-container');
        $videosContainer.html(`<p>Carregando vídeos de ${position}...</p><div class="loading-spinner"></div>`); // Show spinner

        setTimeout(() => {
            const players = [
                // Replace these with your actual image/video paths
                { name: 'Goleiro A', position: 'Goleiro', rating: 4.8, video: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', youtubeId: 'dQw4w9WgXcQ' }, 
                { name: 'Goleiro B', position: 'Goleiro', rating: 4.5, video: 'https://via.placeholder.com/400x225/FF0000/FFFFFF?text=Video+Goleiro+B' },
                { name: 'Zagueiro X', position: 'Zagueiro', rating: 4.7, video: 'https://via.placeholder.com/400x225/00FF00/FFFFFF?text=Video+Zagueiro+X' },
                { name: 'Lateral D. P', position: 'Lateral Direito', rating: 4.6, video: 'https://via.placeholder.com/400x225/0000FF/FFFFFF?text=Video+Lateral+D' },
                { name: 'Lateral E. Q', position: 'Lateral Esquerdo', rating: 4.4, video: 'https://via.placeholder.com/400x225/FFFF00/000000?text=Video+Lateral+E' },
                { name: 'Volante R', position: 'Volante', rating: 4.9, video: 'https://img.youtube.com/vi/2N0lR052JjM/hqdefault.jpg', youtubeId: '2N0lR052JjM' },
                { name: 'Meio-Campo S', position: 'Meio-Campo', rating: 4.7, video: 'https://via.placeholder.com/400x225/00FFFF/000000?text=Video+Meio-Campo+S' },
                { name: 'Atacante T', position: 'Atacante', rating: 5.0, video: 'https://img.youtube.com/vi/S-sP-9F2-pI/hqdefault.jpg', youtubeId: 'S-sP-9F2-pI' },
                { name: 'Atacante U', position: 'Atacante', rating: 4.8, video: 'https://via.placeholder.com/400x225/800080/FFFFFF?text=Video+Atacante+U' },
            ];

            const filteredPlayers = players.filter(player => player.position === position);
            filteredPlayers.sort((a, b) => b.rating - a.rating); // Sort by rating (descending)

            if (filteredPlayers.length > 0) {
                const playerHtml = filteredPlayers.map(player => `
                    <div class="player-video-card">
                        <h3>${player.name}</h3>
                        <p>Posição: ${player.position} | Avaliação: ${player.rating}</p>
                        ${player.youtubeId ? 
                            `<div class="video-responsive">
                                <iframe src="https://www.youtube.com/embed/${player.youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                            </div>` :
                            `<div class="video-responsive">
                                <img src="${player.video}" alt="Video Thumbnail for ${player.name}" style="width:100%; height:100%; object-fit: cover;">
                            </div>`
                        }
                    </div>
                `).join('');
                $videosContainer.html(playerHtml);
            } else {
                $videosContainer.html(`<p>Nenhum atleta encontrado para a posição de ${position}.</p>`);
            }
        }, 800); 
    }

    // Initial section display (show 'home' on page load)
    // Check if there's a hash in the URL to load a specific section
    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'home';
    showSection(initialSection);

    // Toggle Mobile Menu
    $('#mobile-menu-toggle').on('click', function() {
        $('#nav-menu').toggleClass('active');
        $(this).toggleClass('active');
        // Prevent body scroll when mobile menu is open
        $('body').toggleClass('no-scroll'); 
    });

    // Hide mobile menu when clicking outside
    $(document).on('click', function(event) {
        if (!$(event.target).closest('.main-nav').length && !$(event.target).closest('#mobile-menu-toggle').length) {
            if ($('#nav-menu').hasClass('active')) {
                $('#nav-menu').removeClass('active');
                $('#mobile-menu-toggle').removeClass('active');
                $('body').removeClass('no-scroll');
            }
        }
    });

    // Theme Toggle functionality
    $('#theme-toggle').on('click', function() {
        $('body').attr('data-theme', $('body').attr('data-theme') === 'light' ? '' : 'light'); 
        const icon = $('#theme-icon');
        if ($('body').attr('data-theme') === 'light') {
            icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
            icon.removeClass('fa-sun').addClass('fa-moon');
        }
    });

    // Header scroll effect
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('#main-header').addClass('scrolled');
        } else {
            $('#main-header').removeClass('scrolled');
        }
    });

    // Loading Screen functionality
    $(window).on('load', function() {
        $('#loading-screen').fadeOut('slow', function() {
            $(this).remove();
        });
    });

    // Trigger showPlayers when a position is clicked in the #posicoes section
    $('.position').on('click', function() {
        const position = $(this).data('position');
        showPlayers(position);
    });
});
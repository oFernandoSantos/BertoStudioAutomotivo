gsap.registerPlugin(ScrollTrigger);
// no celular a barra de endereço some/aparece no scroll; sem isso o pin recalcula e pula
ScrollTrigger.config({ ignoreMobileResize: true });

// Sem zoom: o Safari do iPhone ignora user-scalable=no, então a pinça é barrada aqui
["gesturestart", "gesturechange"].forEach((t) =>
  document.addEventListener(t, (e) => e.preventDefault(), { passive: false })
);
document.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false }
);

// Avaliações e mapa vêm de js/dados.js (ENDERECO e AVALIACOES)
const listaAvaliacoes = document.querySelector(".js-avaliacoes");
(typeof AVALIACOES !== "undefined" ? AVALIACOES : []).forEach((a) => {
  const card = document.createElement("article");
  card.className =
    "shrink-0 w-44 mr-2.5 rounded-lg border border-white/10 bg-neutral-900 p-2.5 flex flex-col gap-1 select-none";
  card.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 shrink-0 rounded-full bg-borda flex items-center justify-center text-[10px] font-semibold js-inicial"></div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-semibold truncate js-nome"></p>
        <p class="text-[10px] text-neutral-500 js-quando"></p>
      </div>
      <span class="text-xs"><svg viewBox="0 0 48 48" class="inline-block w-[1em] h-[1em] align-[-0.125em]" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg></span>
    </div>
    <div class="text-yellow-400 text-[10px] js-estrelas"></div>
    <p class="text-[11px] text-neutral-300 leading-snug line-clamp-3 js-texto"></p>`;
  // textContent: o texto colado nunca vira HTML
  card.querySelector(".js-inicial").textContent = (a.nome || "?").trim().charAt(0).toUpperCase();
  card.querySelector(".js-nome").textContent = a.nome;
  card.querySelector(".js-quando").textContent = a.quando || "";
  const nota = Math.max(0, Math.min(5, Math.round(a.nota || 5)));
  card.querySelector(".js-estrelas").innerHTML =
    '<i class="bi bi-star-fill"></i>'.repeat(nota) + '<i class="bi bi-star text-neutral-600"></i>'.repeat(5 - nota);
  card.querySelector(".js-texto").textContent = a.texto;
  listaAvaliacoes.append(card);
});
if (typeof ENDERECO !== "undefined") {
  const busca = encodeURIComponent(ENDERECO);
  document.querySelector(".js-mapa").src = `https://www.google.com/maps?q=${busca}&output=embed`;
  document.querySelector(".js-rota").href = `https://www.google.com/maps/search/?api=1&query=${busca}`;
  // endereço em 2 linhas fixas (rua e número / bairro e cidade), sem quebrar no meio
  const partes = ENDERECO.split(" - ");
  const linhas = partes.length >= 3 ? [partes.slice(0, 2).join(" - "), partes.slice(2).join(" - ")] : [ENDERECO];
  const alvoEndereco = document.querySelector(".js-endereco");
  linhas.forEach((texto, i) => {
    const linha = document.createElement("span");
    linha.className = i ? "block whitespace-nowrap" : "whitespace-nowrap";
    linha.textContent = texto;
    alvoEndereco.append(linha);
  });
}
// Todos os botões/links de WhatsApp (data-whatsapp) abrem a conversa com a mensagem pronta
if (typeof WHATSAPP !== "undefined") {
  const zap = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`;
  document.querySelectorAll("[data-whatsapp]").forEach((a) => (a.href = zap));
}

// HERO: fixa a seção e usa o scroll para avançar o vídeo e trocar as legendas
const video = document.querySelector(".js-hero-video");
const [c1, c2, c3] = document.querySelectorAll(".js-caption");


// Tela larga: o hero fica preso na tela e o scroll controla o vídeo.
// Tela estreita (mais estreita que 4:3, ex.: celular): o vídeo toca sozinho em loop
// e rolar a página acelera o giro, que volta devagar ao ritmo normal (sem pulos).
// gsap.matchMedia refaz tudo sozinho quando a tela muda de formato.
gsap.matchMedia().add(
  { estreito: "(max-aspect-ratio: 4/3)", largo: "(min-aspect-ratio: 4/3)" },
  ({ conditions }) => {
    // O arquivo segue o formato da tela (e troca se ela mudar):
    // tela estreita = vídeo 4:3 de 720p a 48 quadros/s; tela larga = vídeo inteiro 1080p
    const arquivo = conditions.estreito ? "imgs/hero-mobile.mp4?v=31" : "imgs/hero.mp4?v=27";
    // imagem leve do 1º quadro: o carro aparece na hora, antes do vídeo terminar de carregar
    video.poster = conditions.estreito ? "imgs/hero-mobile-poster.webp?v=7" : "imgs/hero-poster.webp?v=7";
    if (!video.src.endsWith(arquivo)) video.src = arquivo;

    if (conditions.estreito) {
      const BASE = 0.85; // ritmo do giro automático (1 = velocidade normal)
      const MAX = 4; // ritmo máximo (rolagem bem rápida)
      const GANHO = 1.2; // quanto cada px/ms de rolagem soma ao ritmo
      let alvo = BASE, atual = BASE, ultimo = scrollY, tUltimo = performance.now(), quadro;
      video.loop = true;
      video.playbackRate = BASE;
      video.play().catch(() => {});
      // A velocidade do giro acompanha a velocidade da rolagem (px por ms): rolar devagar
      // acelera pouco, rolar rápido acelera muito; para cima ou para baixo, tanto faz.
      const aoRolar = () => {
        const agora = performance.now();
        const vel = Math.abs(scrollY - ultimo) / Math.max(agora - tUltimo, 8);
        ultimo = scrollY;
        tUltimo = agora;
        alvo = Math.min(MAX, Math.max(alvo, BASE + vel * GANHO));
      };
      // As 3 frases seguem o tempo do vídeo (mesmos momentos da versão de computador);
      // a última some no fim e a primeira volta no começo de cada volta do loop.
      const frases = gsap
        .timeline({ paused: true })
        .to({}, { duration: 3 }, 0)
        .to(c1, { opacity: 0, y: -30, duration: 0.3 }, 0.6)
        .fromTo(c2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 1)
        .to(c2, { opacity: 0, y: -30, duration: 0.3 }, 1.8)
        .fromTo(c3, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 2.2);
      // O vídeo do celular é ida e volta (o giro termina e volta por onde veio, sem pular
      // para o início): pos = onde a câmera está no giro, de 0 a META, nos dois sentidos.
      const pos = () => {
        const meta = video.duration / 2, t = video.currentTime;
        return t <= meta ? t : video.duration - t;
      };
      const suavizar = () => {
        alvo += (BASE - alvo) * 0.04; // a aceleração vai se dissipando
        atual += (alvo - atual) * 0.12; // e a velocidade segue o alvo sem trancos
        if (Math.abs(video.playbackRate - atual) > 0.01) video.playbackRate = atual;
        if (video.duration) frases.progress(pos() / (video.duration / 2));
        quadro = requestAnimationFrame(suavizar);
      };
      addEventListener("scroll", aoRolar, { passive: true });
      suavizar();

      // Arrastar o dedo para os lados no hero gira o carro (o vídeo pausa e segue o dedo);
      // ao soltar, volta a girar sozinho. pan-y: arrastar na vertical continua rolando a página.
      const hero = document.querySelector(".js-hero");
      let arrasto = null;
      const aoTocar = (e) => {
        arrasto = { x: e.clientX, y: e.clientY, t: video.currentTime, p: pos(), lateral: false };
      };
      const aoMover = (e) => {
        if (!arrasto || !video.duration) return;
        const dx = e.clientX - arrasto.x;
        if (!arrasto.lateral) {
          if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - arrasto.y)) return;
          arrasto.lateral = true;
          video.pause();
        }
        // o giro inteiro = arrastar 1,5 tela; dedo para a esquerda avança o giro e para
        // nas pontas; continua na metade (ida ou volta) em que o vídeo estava
        const meta = video.duration / 2;
        const p = Math.min(meta - 0.02, Math.max(0, arrasto.p - (dx / (innerWidth * 1.5)) * meta));
        video.currentTime = arrasto.t <= meta ? p : video.duration - p;
      };
      const aoSoltar = () => {
        if (arrasto?.lateral) video.play().catch(() => {});
        arrasto = null;
      };
      hero.style.touchAction = "pan-y";
      hero.addEventListener("pointerdown", aoTocar);
      hero.addEventListener("pointermove", aoMover);
      hero.addEventListener("pointerup", aoSoltar);
      hero.addEventListener("pointercancel", aoSoltar);
      hero.addEventListener("pointerleave", aoSoltar);

      return () => {
        hero.style.touchAction = "";
        hero.removeEventListener("pointerdown", aoTocar);
        hero.removeEventListener("pointermove", aoMover);
        hero.removeEventListener("pointerup", aoSoltar);
        hero.removeEventListener("pointercancel", aoSoltar);
        hero.removeEventListener("pointerleave", aoSoltar);
        removeEventListener("scroll", aoRolar);
        cancelAnimationFrame(quadro);
        frases.kill();
        gsap.set([c1, c2, c3], { clearProps: "opacity,transform" });
        video.loop = false;
        video.playbackRate = 1;
        video.pause();
      };
    }

    // iOS só carrega o vídeo depois de um play; toca e pausa logo em seguida
    video.play().then(() => video.pause()).catch(() => {});
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".js-hero",
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.5,
        },
        onUpdate() {
          // -0.05: o último instante do vídeo pode renderizar em branco
          if (video.duration)
            video.currentTime = this.progress() * (video.duration - 0.05);
        },
      })
      .to({}, { duration: 3 }, 0) // define a duração total da timeline
      .to(c1, { opacity: 0, y: -30, duration: 0.3 }, 0.6)
      .fromTo(c2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 1)
      .to(c2, { opacity: 0, y: -30, duration: 0.3 }, 1.8)
      .fromTo(c3, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 2.2);
  }
);

// Demais seções: cada título/card surge preso ao scroll (sobe e aparece conforme rola,
// some de novo ao rolar para cima). Em grade com várias colunas, cada coluna começa um
// pouco depois da anterior, para os cards da mesma linha surgirem em sequência.
gsap.utils.toArray(".js-reveal").forEach((el) => {
  // cards de serviços têm entrada própria (abaixo), só no computador
  if (el.classList.contains("card-servico")) return;
  // Já visível ao abrir (ex.: Serviços logo abaixo do hero no celular): fica à mostra, sem
  // animação; com clamp() o início e o fim viravam 0 e o elemento ficava invisível até rolar.
  if (el.getBoundingClientRect().top + scrollY < innerHeight * 0.9) return;
  const coluna = () => {
    const pai = el.parentElement;
    const cols = getComputedStyle(pai).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const irmaos = [...pai.children].filter((e) => e.classList.contains("js-reveal"));
    return cols > 1 ? irmaos.indexOf(el) % cols : 0;
  };
  gsap.fromTo(
    el,
    { opacity: 0, y: 60, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        // clamp(): no fim da página (ex.: Contato) a animação termina mesmo sem espaço para
        // rolar; sem isso o botão ficava parado no meio (meio transparente e borrado)
        start: () => `clamp(top ${98 - coluna() * 5}%)`,
        end: () => `clamp(top ${72 - coluna() * 5}%)`,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    }
  );
});

// Celular: pilha dos cards de serviços. Rolando para baixo, os cards grudam no topo (um sobre o
// outro); rolando para cima, a pilha passa para baixo da tela, invertida (classe .pilha-baixo no CSS).
// O card que vai sendo coberto encolhe e escurece aos poucos, conforme quanto está coberto.
gsap.matchMedia().add("(max-width: 767px)", () => {
  const cards = gsap.utils.toArray(".card-servico");
  const grade = cards[0]?.parentElement;
  if (!grade) return;
  let ultimo = scrollY, baixo = false;
  // o evento de scroll já chega uma vez por frame; desenha direto
  const desenha = () => {
    const dy = scrollY - ultimo;
    if (Math.abs(dy) > 4) {
      // o lado da pilha é decidido pela direção com que se chega à seção e fica fixo enquanto
      // ela está na tela: assim, ao inverter no meio, a pilha se desfaz na ordem contrária
      // em vez de pular de uma vez para o outro lado
      const rg = grade.getBoundingClientRect();
      const fora = rg.bottom < 0 || rg.top > innerHeight;
      const subindo = dy < 0;
      if (fora && subindo !== baixo) {
        baixo = subindo;
        grade.classList.toggle("pilha-baixo", baixo);
      }
      ultimo = scrollY;
    }
    const r = cards.map((c) => c.getBoundingClientRect());
    cards.forEach((c, i) => {
      const h = c.offsetHeight;
      let p = 0;
      if (!baixo && cards[i + 1]) {
        // coberto pelo próximo, que sobe por cima (origem no topo: o topo não se mexe com a escala)
        p = (r[i].top + h - r[i + 1].top) / h;
      } else if (baixo && cards[i - 1]) {
        // coberto pelo anterior, que desce por cima (origem embaixo: a base não se mexe)
        p = (r[i - 1].bottom - (r[i].bottom - h)) / h;
      }
      p = Math.min(1, Math.max(0, p));
      c.style.transformOrigin = baixo ? "50% 100%" : "50% 0%";
      c.style.transform = p ? `scale(${1 - 0.08 * p})` : "";
      // embaixo escurece menos, para os degraus da pilha continuarem visíveis
      c.style.filter = p ? `brightness(${1 - (baixo ? 0.3 : 0.55) * p})` : "";
    });
  };
  addEventListener("scroll", desenha, { passive: true });
  desenha();
  return () => {
    removeEventListener("scroll", desenha);
    grade.classList.remove("pilha-baixo");
    cards.forEach((c) => (c.style.transform = c.style.filter = c.style.transformOrigin = ""));
  };
});

// Cards de serviços: no computador surgem só com opacidade (sem mexer no transform, para o
// "crescer ao passar o mouse" do CSS funcionar); no celular ficam na pilha, sem entrada.
// gsap.matchMedia desfaz tudo sozinho quando a tela muda de largura.
gsap.matchMedia().add("(min-width: 768px)", () => {
  gsap.utils.toArray(".card-servico").forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1,
      ease: "none",
      scrollTrigger: { trigger: el, start: `top ${98 - (i % 5) * 4}%`, end: `top ${75 - (i % 5) * 4}%`, scrub: 0.6 },
    });
  });
});

// Mudou a largura da tela (girou o celular, redimensionou a janela): recalcula as posições
// das animações presas ao scroll, para nada ficar invisível com posição antiga
let larguraTela = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === larguraTela) return;
  larguraTela = innerWidth;
  ScrollTrigger.refresh();
});

// Carrosséis (Trabalhos e Avaliações): passam sozinhos e também aceitam rolagem manual
// (dedo, roda do mouse, arrastar com o mouse). Pausam enquanto a pessoa mexe ou está com
// o mouse em cima, e voltam sozinhos depois.
const VELOCIDADE = 40; // px por segundo (igual em qualquer tela, 60 ou 144 Hz)
const animarCarrossel = (trilho) => {
  const faixa = trilho.querySelector(".js-carrossel");
  if (!faixa.children.length) return;
  // repete os cards até cobrir a largura da tela + uma volta; quando uma volta acaba,
  // emenda na cópia seguinte sem pulo (funciona mesmo com poucos cards)
  const originais = [...faixa.children];
  const volta = faixa.scrollWidth; // largura de um conjunto de cards
  do {
    originais.forEach((card) => {
      const copia = card.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      faixa.append(copia);
    });
  } while (faixa.scrollWidth < trilho.clientWidth + volta * 2);
  let posicao = 0, pausadoAte = 0, mouseEmCima = false, tAnterior = performance.now();
  const metade = () => volta;
  const pausar = (ms = 2500) => (pausadoAte = performance.now() + ms);
  const passar = (agora) => {
    const dt = Math.min(agora - tAnterior, 100) / 1000; // segundos desde o último quadro
    tAnterior = agora;
    if (Math.abs(trilho.scrollLeft - posicao) > 2) posicao = trilho.scrollLeft; // a pessoa rolou
    if (!mouseEmCima && agora > pausadoAte) posicao += VELOCIDADE * dt;
    if (posicao >= metade()) posicao -= metade();
    if (posicao < 0) posicao += metade();
    trilho.scrollLeft = posicao;
    requestAnimationFrame(passar);
  };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(passar);
  trilho.addEventListener("mouseenter", () => (mouseEmCima = true));
  trilho.addEventListener("mouseleave", () => (mouseEmCima = false));
  trilho.addEventListener("touchstart", () => pausar(), { passive: true });
  trilho.addEventListener("wheel", () => pausar(), { passive: true });
  // arrastar com o mouse (no computador)
  let arrastando = false, xInicio = 0, scrollInicio = 0;
  trilho.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    arrastando = true;
    xInicio = e.clientX;
    scrollInicio = trilho.scrollLeft;
    pausar();
  });
  addEventListener("pointermove", (e) => {
    if (!arrastando) return;
    trilho.scrollLeft = scrollInicio - (e.clientX - xInicio);
    pausar();
  });
  addEventListener("pointerup", () => (arrastando = false));
  trilho.addEventListener("dragstart", (e) => e.preventDefault()); // não arrasta a imagem
};
document.querySelectorAll(".js-trilho").forEach(animarCarrossel);

// Menu do celular: fecha ao escolher um link
document.querySelectorAll("details nav a").forEach((a) =>
  a.addEventListener("click", () => a.closest("details").removeAttribute("open"))
);

// Links internos (#servicos etc.) rolam suave via JS. O scroll-behavior: smooth do CSS
// não pode ser usado: ele atrasa o scroll e o pin do vídeo se perde ao rolar para cima.
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const alvo = document.querySelector(a.getAttribute("href"));
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", a.getAttribute("href"));
  })
);

// Imagens que terminam de carregar mudam a altura da página: recalcula as posições
addEventListener("load", () => ScrollTrigger.refresh());

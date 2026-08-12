# CRM da FG — o painel em `/admin`

Documento vivo. Quem for mexer no painel lê isto antes.

## O que é

Uma área `/admin` **dentro do site da FG**, que funciona como CRM de consórcio.
Hoje é uma **demonstração para apresentar à Priscila**: os dados são fictícios e
moram no `localStorage` de quem abre a página. Todas as telas são reais e
navegáveis; o que muda no dia em que virar produção é só a camada de dados.

Acesso: `fgrepresentacoes.com.br/admin` — senha em `src/admin/data/constantes.ts`
(`SENHA_PADRAO`). **Não existe link para o painel na landing**, e não deve existir.

## As três regras que não podem ser quebradas

**1. Nada fora de `src/admin/` importa de `src/admin/`.** A única ponte é o
`lazy(() => import("./admin/AdminApp"))` no `App.tsx`. Um import solto joga o CRM
inteiro dentro do bundle da landing, que é destino de tráfego pago. Confira com:

```bash
grep -rn 'from "\./admin\|from "\.\./admin' src | grep -v "^src/admin/"
```

**2. `npm run build` ao fim de cada mudança.** O `tsconfig` tem `noUnusedLocals`
e o build roda `tsc -b`: um import que sobrou **passa no `npm run dev` e quebra em
produção**. Já aconteceu uma vez com tipos não usados no `repositorioLocal.ts`.

**3. O chunk de entrada não pode crescer.** Linha de base antes do painel:
`index-*.js` = **301.435 B (104 KB gzip)**. Depois do roteador: 303.100 B. Se
esse número pular, algum import vazou (ver regra 1). O painel vive no chunk
`AdminApp-*.js`, que pode crescer à vontade.

## Como está montado

```
src/
  App.tsx           decisor de rota: /admin → lazy(AdminApp); resto → LandingPage
  LandingPage.tsx   o site público (era o corpo do App.tsx)
  lib/rota.ts       roteador caseiro: pushState + evento fg:rota
  hooks/useRota.ts  hook que reage a popstate e a fg:rota
  index.css         design system + classes do painel (.btn-sm, .badge, .card-painel)
  admin/
    AdminApp.tsx      senha + roteamento interno (/admin/<tela>[/<id>])
    components/       Layout (sidebar+topbar), Login, Elo, IconesAdmin, ...
    pages/            uma por tela
    data/             tipos, constantes, repositorio, repositorioLocal, seed, useDados
    lib/              formato, consorcio, metricas, id
```

**Roteador caseiro e não react-router**: a decisão de rota mora no chunk de
entrada, o mesmo que a landing baixa. Um router pronto custaria ~15 KB gzip no
caminho crítico do tráfego pago para servir uma rota que quase ninguém abre.

**`LandingPage.tsx` existe por um motivo específico**: tirar `Header` (z-50),
`WhatsAppFloat` (z-40) e `WhatsAppModal` da árvore quando a rota é `/admin`.
Sem isso eles ficariam fixos por cima do painel.

**Links internos usam `<Elo para="...">`**, nunca `<button onClick={navegar}>` —
o `Elo` é um `<a>` de verdade, então cmd+clique continua abrindo em nova aba.

## Dados

`repositorio.ts` define a interface; `repositorioLocal.ts` implementa sobre
`localStorage`. **Todo método é `Promise`, mesmo lendo da memória** — é isso que
permite trocar por Supabase depois sem tocar em nenhuma tela:

```ts
export const repositorio: Repositorio = repositorioLocal;  // trocar SÓ esta linha
```

Não há context nem reducer (o projeto não usa nenhum): cada mutação dispara o
evento `fg:dados` no `window` e o hook `useDados` recarrega. É o mesmo padrão do
`fg:abrir-form` que o modal do site já usava.

⚠️ No `useDados`, a `chave` é uma string montada à mão. A função `carregar` **não
pode** entrar no array de dependências — arrow nova a cada render = loop infinito.

### O seed (`data/seed.ts`)

Determinístico (LCG com semente fixa): a demonstração testada aqui é exatamente a
que o cliente vê. Gera 152 leads em 120 dias, 5 consultores, 35 vendas em 8 meses,
~680 interações, 30 tarefas (3 atrasadas de propósito — é o gancho da
apresentação), metas e investimento de mídia por mês.

**Os consultores são o time real da FG, com as fotos que já estão em
`public/equipe/`** — Priscila, Adriele, Filipe, Júlia e Isabelle. É o detalhe que
faz a diretora reconhecer a própria equipe na primeira olhada. Não trocar por
nomes genéricos.

## Armadilhas conhecidas

| Armadilha | O que fazer |
|---|---|
| `noUnusedLocals` quebrando o build | `npm run build` a cada etapa |
| `scroll-behavior: smooth` do site | `html.admin-ativo` desliga (AdminApp cuida) |
| Data um dia atrasada | ISO sempre com hora; formatar só em `lib/formato.ts` |
| Telefone fictício abrindo conversa real | `config.modoDemo` mostra a mensagem em vez de abrir o `wa.me` |
| Demo com datas velhas | Configurações → "Atualizar datas da demonstração" |
| StrictMode duplicando o seed | `obter()` é idempotente — não remover a checagem de versão |
| Reseed apagando o que a cliente mexeu | Congelar `VERSAO_BASE` durante as apresentações |
| Recharts com altura 0 | `ResponsiveContainer` exige pai com altura explícita |
| GSAP no painel | Não usar: o ScrollTrigger erra em containers roláveis internos |

## Sobre a senha

Ela vai **em texto puro no JavaScript** que o navegador baixa. Serve para afastar
curiosos e para a demonstração parecer um sistema — **não é segurança**. É
aceitável hoje porque não existe dado real: a base é fictícia e local a cada
visitante. No dia em que entrar telefone de cliente, isto vira Supabase Auth com
RLS por dono do lead, e o rewrite do `vercel.json` precisa passar a excluir
`/api/*`: `{"source": "/((?!api/).*)", "destination": "/"}`.

## Estado atual

- [x] Etapa 1 — rota e isolamento da landing
- [x] Etapa 2 — shell: login, sidebar, topbar, 10 telas navegáveis
- [x] Etapa 3 — camada de dados, repositório e seed
- [ ] Etapa 4 — funil kanban e ficha do lead
- [ ] Etapa 5 — dashboard com KPIs e gráficos
- [ ] Etapa 6 — simulador de consórcio
- [ ] Etapa 7 — vendas e equipe
- [ ] Etapa 8 — integrações e relatórios
- [ ] Etapa 9 — configurações, proteção e acabamento

## Antes de apresentar

1. **Calibrar as taxas com a Priscila** (`PADROES_MODALIDADE` em `constantes.ts`).
   Os valores são plausíveis mas ilustrativos, e ela trabalha com isso há 15 anos.
   Uma parcela errada na frente dela custa mais do que o painel inteiro ganha.
2. Configurações → "Atualizar datas da demonstração".
3. Conferir que `modoDemo` está ligado.

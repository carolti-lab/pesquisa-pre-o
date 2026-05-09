# Pesquisa Nó · Van Westendorp

Página de pesquisa de preço para os founding clients do Nó. Coleta as 4 perguntas canônicas de Van Westendorp, uma por tela, e armazena as respostas no Vercel KV.

## Estrutura

```
pesquisa-no/
├── index.html         ← página da pesquisa (rota: /)
├── admin.html         ← painel de respostas (rota: /admin)
├── api/
│   ├── submit.js      ← recebe respostas
│   └── admin.js       ← lista respostas (protegido por chave)
├── package.json
└── vercel.json
```

## Deploy passo a passo

### 1. Subir pro GitHub
Mesmo processo da calculadora ROI:
- Cria um repositório novo no GitHub: `pesquisa-no`
- Envia esses arquivos pra lá

### 2. Conectar no Vercel
- Em vercel.com → "Add New Project" → importar o repo `pesquisa-no`
- Framework preset: **Other** (não é Next.js, é HTML estático com Functions)
- Clica em "Deploy"

### 3. Ativar o Vercel KV (banco de dados)
Depois do primeiro deploy:
- Entra no projeto no Vercel → aba **Storage** → **Create Database** → **KV**
- Nome sugerido: `pesquisa-no-db`
- Conecta ao projeto: o Vercel automaticamente injeta as variáveis de ambiente (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.)
- **Não precisa fazer mais nada** — o código já usa essas variáveis

### 4. Criar a chave de admin
- Ainda no Vercel, projeto → **Settings** → **Environment Variables**
- Adiciona: `ADMIN_KEY` = `[uma senha forte que só você sabe]`
- Exemplo: `ADMIN_KEY=carol_no_2026_pesquisa_x9k2`
- Aplica em: **Production**, **Preview**, **Development**
- Faz **Redeploy** depois (botão no topo)

### 5. Conectar o subdomínio `pesquisa.nosistema.com.br`
- No Vercel, projeto → **Settings** → **Domains** → adicionar `pesquisa.nosistema.com.br`
- O Vercel mostra um registro DNS (tipo CNAME) que precisa ir no registro.br
- No registro.br, painel do `nosistema.com.br` → DNS → adicionar:
  - Nome: `pesquisa`
  - Tipo: CNAME
  - Valor: `cname.vercel-dns.com.` (o Vercel mostra o valor exato)
- Espera ~10 minutos pra propagar
- O HTTPS é automático

## Como usar depois de no ar

### Compartilhar com os founding clients
Manda pra eles o link: `https://pesquisa.nosistema.com.br`

Sugestão de mensagem (WhatsApp):

> Oi [nome]! Tô calibrando o preço do Nó com vocês 10 do grupo fundador antes de abrir pra fora. São 4 perguntas, leva 5 minutos: https://pesquisa.nosistema.com.br
>
> Sua resposta é confidencial e me ajuda muito a definir um valor que faz sentido pra confeitaria de verdade. ❤️
>
> — Carol

### Ver as respostas
Acessa `https://pesquisa.nosistema.com.br/admin` e digita a chave que você definiu na etapa 4.

No painel você vê:
- Total de respostas e médias de cada pergunta
- Tabela com cada resposta individual
- Botão pra baixar tudo em CSV
- O JSON bruto pronto pra colar no gráfico Van Westendorp (próximo entregável)

## Próximo passo: gráfico Van Westendorp
Depois que você tiver pelo menos umas 6-8 respostas, pedir pro Claude:
> "Carol: criar o gráfico Van Westendorp com base nos dados da pesquisa"

E colar o JSON copiado do painel admin. O gráfico vai calcular automaticamente PMC, PME, IPP e OPP.

## Notas técnicas

- **Custo Vercel KV gratuito:** 30 mil comandos/mês. Pra essa pesquisa com 10 respostas, é absolutamente desprezível.
- **Backup:** se a pessoa preencher e o servidor cair, a resposta vai pro localStorage do navegador dela como fallback. Pode-se recuperar manualmente se acontecer.
- **LGPD:** a pesquisa não pede dados sensíveis. Nome e e-mail são opcionais. O IP é registrado mas só visível no log interno (uso anti-spam).

# Supabase Database Setup

Este diretório contém as migrações SQL e a documentação do banco de dados para a plataforma **PrecifiQ**.

## Como executar a migração

### 1. No Supabase Dashboard (Produção / Homologação)
1. Acesse o [Supabase Dashboard](https://app.supabase.com).
2. Selecione o seu projeto.
3. No menu lateral, vá em **SQL Editor**.
4. Clique em **New Query**.
5. Copie o conteúdo do arquivo `migrations/001_initial_schema.sql` e cole no editor.
6. Clique em **Run** (ou pressione `Cmd/Ctrl + Enter`).

**Importante:** Para que o painel de administrador funcione, você precisa definir a variável de ambiente do e-mail do admin no banco. No SQL Editor do Supabase, execute:
```sql
ALTER DATABASE postgres SET "app.settings.admin_email" TO 'seu_email_de_admin@dominio.com';
```

### 2. Usando Supabase CLI (Desenvolvimento Local)
Se você estiver utilizando a CLI do Supabase para desenvolvimento local:
1. Inicie o Supabase localmente: `supabase start`
2. As migrações dentro da pasta `supabase/migrations/` serão aplicadas automaticamente ao iniciar.

## Como resetar o banco de dados (Apenas Desenvolvimento)

Caso precise limpar o banco de dados e aplicar as migrações novamente com os dados de seed originais:

### Via CLI (Recomendado para dev local)
Execute o comando abaixo no terminal:
```bash
supabase db reset
```

### Via SQL Editor
Você terá que deletar o schema `public` (CUIDADO: não faça isso em produção) e recriá-lo:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
E então rodar o script `001_initial_schema.sql` novamente.

---

## Diagrama de Relacionamentos (Entity-Relationship)

O diagrama abaixo ilustra como as tabelas do banco de dados estão relacionadas entre si. 
A tabela `companies` atua como o eixo central da estrutura multitenant (SaaS B2B).

```text
auth.users (Supabase Auth)
  │
  └── 1:1 ── user_profiles
                 │ role (owner/admin)
                 │
                 └── N:1 ── companies (Eixo Central)
                                │
                                ├── 1:1 ── fiscal_profiles
                                │
                                ├── 1:N ── products
                                │            │
                                │            └── 1:N ── technical_sheet_items
                                │
                                ├── 1:N ── services
                                │
                                ├── 1:N ── price_calculations
                                │            │ (Referências Opcionais)
                                │            ├── N:1 ── products (product_id)
                                │            └── N:1 ── services (service_id)
                                │
                                ├── 1:1 ── subscriptions
                                │            │
                                │            └── 1:N ── payments
                                │
                                ├── 1:N ── notifications
                                │
                                └── 1:N ── xml_imports
```

### Resumo das Relações
- **companies**: Tabela principal. Representa um negócio cadastrado na plataforma.
- **user_profiles**: Vincula usuários autenticados (via `auth.users`) a uma `company`.
- **fiscal_profiles**: Dados fiscais e tributários únicos de cada empresa.
- **products & services**: O catálogo da empresa. Os produtos podem ter componentes vinculados em `technical_sheet_items`.
- **price_calculations**: Registra toda vez que o usuário calcula o preço de algo. Guarda um snapshot histórico dos impostos aplicados.
- **subscriptions & payments**: Integração de cobrança SaaS (ex: Asaas).
- **notifications**: Alertas do sistema (inadimplência, mudança de impostos).
- **xml_imports**: Controle de notas fiscais importadas para facilitar o cadastro de produtos e custos.

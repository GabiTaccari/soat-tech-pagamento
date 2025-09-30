graph TD
A[Mermaid ok?] --> B{Renderizou?}
B -->|sim| C[Pronto!]
B -->|não| D[Ver passos abaixo]



# FastFood API - SOAT Tech Challenge
<hr>
Este projeto é uma API para um sistema de autoatendimento de uma lanchonete, desenvolvida utilizando arquitetura hexagonal e clean architecture.
<br>
<h2>Arquitetura desenvolvida</h2>
<br><br>
<img align="center" width="821" height="831" alt="Arquitetura Cluster Aplicação" src="https://github.com/user-attachments/assets/10df2e49-5607-4cf1-b8c8-6cba4c3f16db" />
<br><br>
<img align="center" width="761" height="571" alt="Arquitetura Aplicação" src="https://github.com/user-attachments/assets/b3072f35-9d00-493e-a2e7-7ddfcaf5a6a9" />

<h2>Funcionalidades atendidas:</h2>

- Produtos:
    - Cadastro de novos produtos
    - Alteração de dados dos produtos
    - Deleção/Inativação do produto
    - Busca de produto
    - Listagem de produto
      
- Clientes:
    - Cadastro de novos clientes
    - Atualização de dados de clientes
    - Deleção/Inativação de cliente
    - Busca de cliente
    - Listagem de clientes
 
- Pedido:
    - Cadastro de novos pedidos
    - Atualização de status de pedido
    - Atualização de status de pagamento do pedido
    - Busca de pedido
    - Listagem de pedidos
 
- Pagamento:
    - Criação de novo pagamento para pedido
    - QR Code de pagamento do mercado pago
    - Webhook de retorno para confirmação de pagamento
    - Consulta de status de pagamento
  
<h2>Como executar localmente</h2>
Nota: No caso de execução localmente, necessário comentar a linha XX do arquivo .env e descomentar a linha XX do arquivo .env (banco de dados)<br/>
Start do ngrok -> necessário para o webhook do mercado pago.<br/>


```
ngrok http localhost:3000
```
Substituir a URL fornecida pelo ngrok no arquivo XX, linha XX. Isso fará com que o pagamento seja retornado pelo MP e atualizado em nossa base de dados.
Start do docker:
```console
docker compose build --no-cache
docker compose up
```

<h2>Como executar localmente (minikube)</h2>
Minikube/Kubernete

```bash
minikube start
minikube service soat-tech-service
kubectl get pods
kubectl exec
NOME_DO_POD -- npx prisma migrate dev --name init
NOME_DO_POD -- sh
npx ts-node /app/prisma/seed.ts
kubectl rollout restart deployment soat-tech-deployment
```
Start do ngrok -> necessário para o webhook do mercado pago.
```console
kubectl get services
minikube ip
ngrok http minikube_ip:porta_get_services
```

<h2>Postman Collection e execução das APIs:</h2>
<br><br>
<h4>Postman Collection</h4><br>
O arquivo da collection do postman está disponível na raiz desse repositório, sendo disponibilizada nesse link: https://github.com/GabiTaccari/fiap-fase2/blob/main/SOAT%20Tech%20-%20fase%202.postman_collection
<br>
Afim de evitar erros, também está disponível pelo google drive, através do link: https://drive.google.com/file/d/1BJyUuyNDVpgjI51X_1XthT1ZwEoZfuzO/view?usp=sharing <br>
<br>

<h4>Ordem de execução das APIs:</h4>


<h2>Vídeo de apresentação:</h2>


Mermaid ERD:

erDiagram
  CLIENTE ||--o{ PEDIDO : "clienteId"
  PEDIDO  ||--|{ ITEM_PEDIDO : "contém"
  PRODUTO ||--o{ ITEM_PEDIDO : "aparece_em"
  PEDIDO  ||--|| PAGAMENTO : "possui"
  CATEGORIA_PRODUTO ||--o{ PRODUTO : "categoriaId"

  CLIENTE {
    string  id PK
    string  nome
    string  email UNIQUE
    string  cpf UNIQUE
    bool    ativo
    bool    recebeEmail
    datetime criadoEm
    datetime atualizadoEm
  }

  CATEGORIA_PRODUTO {
    string  id PK
    string  nome UNIQUE
    datetime criadoEm
    datetime atualizadoEm
  }

  PRODUTO {
    string  id PK
    string  nome
    decimal preco
    string  categoriaId FK
    datetime criadoEm
    datetime atualizadoEm
  }

  PEDIDO {
    string  id PK
    string  clienteId FK nullable
    string  statusPedido      // enum: RECEBIDO | EM_PREPARACAO | PRONTO | FINALIZADO
    string  statusPagamento   // enum: AGUARDANDO | APROVADO | RECUSADO | ESTORNADO
    datetime criadoEm
    datetime atualizadoEm
  }

  ITEM_PEDIDO {
    string pedidoId PK,FK
    string produtoId PK,FK
    int    quantidade
  }

  PAGAMENTO {
    string  id PK
    string  pedidoId UNIQUE,FK  // 1:1 com Pedido
    string  metodo
    string  status              // enum StatusPagamento
    datetime criadoEm
    datetime atualizadoEm
  }


Escolhemos PostgreSQL pela maturidade, suporte a transações, constraints fortes (FK, unique, enums via Prisma), facilidade de migração com Prisma, e por ser oferecido como serviço gerenciado (AWS RDS). Para nosso domínio (pedidos, itens, pagamentos) a modelagem relacional garante integridade (ex.: ItemPedido com PK composta) e consultas eficientes com índices (statusPedido, criadoEm, clienteId).
Rodando as migrations:
```console
npx prisma migrate deploy
npx prisma db seed
```

<br>
<h3>Alunos:</h3><br>
Gabriela Gonçalves Taccari (RM:rm360973 Discord:)<br/>
Rainer Lima Gramm<br/>
Felipe Mello <br/>

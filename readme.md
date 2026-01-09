# FastFood API - SOAT Tech Challenge
<hr>
Este projeto é uma API para um sistema de autoatendimento de uma lanchonete, desenvolvida utilizando arquitetura hexagonal e clean architecture.
<br>
<h2>Arquitetura desenvolvida</h2>
<img align="center" width="570" height="570" alt="Arquitetura Aplicação" src="https://raw.githubusercontent.com/GabiTaccari/soat-tech-pagamento/refs/heads/main/diagrama.png" />
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

 <h2>Postman Collection e execução das APIs:</h2>
<br><br>
<h4>Postman Collection</h4><br>
O arquivo da collection do postman está disponível na raiz desse repositório, sendo disponibilizada nesse link: https://github.com/GabiTaccari/fiap-fase2/blob/main/SOAT%20Tech%20-%20fase%202.postman_collection
<br>

<h4>Ordem de execução das APIs:</h4>
- Cadastro de cliente<br/>
- Listar categoria (para ter o ID da categoria ao criar o produto)<br/>
- Cadastro de produto<br/>
- Criação de pedido<br/>
- Gerar pagamento qr code<br/>
- Consultar status do pedido<br/>
- Atualizar status do pagamento (caso não efetuado via qr code)<br/>
- Atualizar status do pedido<br/>
<br/>

<h2>Vídeo de apresentação:</h2>
https://www.youtube.com/watch?v=0vOqRazB4oI

<h2>Evidência de cobertura de testes</h2>
<br>
<h4>Pagamento: </h4>
<br>
<h4>Pedido: </h4>
<br>
<h4>Produção: </h4>


<br>
<h3>Alunos:</h3><br>
Gabriela Gonçalves Taccari (RM:rm360973 Discord: #gabriela3468)<br/>
Rainer Lima Gramm (RM: 360974 Discord: #gramm9227)<br/>
Felipe Mello (RM: 361257)<br/>


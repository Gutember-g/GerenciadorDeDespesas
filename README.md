Gerenciador de Despesas Diárias 💰

Aplicação de console em Java para registrar e acompanhar gastos ao longo da semana, comparando o total com um orçamento definido e emitindo alertas quando o limite é ultrapassado.

Sobre o projeto
Este projeto foi desenvolvido como parte dos meus estudos de Java básico, com foco em:

Sintaxe fundamental da linguagem

Variáveis, tipos primitivos e String

Estruturas de decisão (, , ifelseswitch)

Estruturas de repetição (, , forwhiledo-while)

Arrays para armazenamento em memória

Entrada de dados pelo console com Scanner

O código foi escrito enquanto estudo o livro "Java – Guia do Programador: Atualizado para Java 16", de Peter Jandl Jr., aplicando principalmente os conceitos do capítulo de Sintaxe Java.

Funcionalidades
Registro de gastos diários organizados por categoria (ex.: alimentação, transporte, lazer, outros).

Armazenamento dos valores em memória para os 7 dias da semana.

Cálculo do total gasto na semana.

Compare do total com um orçamento mensal pré-definido.

Alerta quando os gastos ultrapassam um percentual configurado do orçamento (por exemplo, 80%).

Menu interativo em console para facilitar o uso.

Tecnologias utilizadas
Linguagem: Java

Versão alvo: Java 16+

Entrada de dados: java.util.Scanner

Execução: console (terminal ou console da IDE)

Conceitos de Java praticados
Este projeto foi pensado como um exercício prático para consolidar:

Criação de classe principal e método .main

Declaração e uso de variáveis locais e variáveis de classe.

Controle de fluxo com e para o menu e regras de negócio.if/elseswitch

Uso de laços de repetição para percorrer arrays e somar valores.

Manipulação de arrays para armazenar gastos por dia/categoria.

Organização do código em métodos específicos (registro, relatórios, leitura de entrada), melhorando legibilidade.

Estrutura do código (exemplo)
GerenciadorDespesas

main(String[] args): ponto de entrada da aplicação.

mostrarMenu(): exibe o menu principal e controla a navegação.

registrarGasto(): registra um novo gasto para um dia/categoria.

relatorioDia(): exibe o gasto acumulado de um dia específico.

relatorioSemana(): calcula total semanal, compara com orçamento e emite alertas.

Métodos auxiliares de leitura e validação de entrada (, , etc.).lerInteirolerDouble

Como executar
Clonar o repositório:

bash
git clone https://github.com/seu-usuario/gerenciador-despesas-diarias.git
Acessar a massa do projeto:

bash
cd gerenciador-despesas-diarias
Compilador:

bash
javac GerenciadorDespesas.java
Executor:

bash
java GerenciadorDespesas
Objetivo de aprendizagem
O propósito principal deste projeto é aprender e fixar:

A base da sintaxe Java aplicada em um problema real do dia a dia (controle de despesas).

Como transformar requisitos simples em um programa console estruturado.

Como preparar código de estudo para servir como primeiro passo de portfólio.

Este repositório faz parte do meu processo de formação como desenvolvedor Java, documentando minha evolução capítulo a capítulo do livro "Java – Guia do Programador: Atualizado para Java 16".

Próximos passos (evoluções futuras)
Permitir configurar o orçamento mensal e o percentual de alerta pelo usuário.

Registrar categorias dinamicamente em vez de fixas.

Exportar relatórios para arquivo de texto ou CSV.

Tratar entradas inválidas de forma mais robusta (validação e novas tentativas).

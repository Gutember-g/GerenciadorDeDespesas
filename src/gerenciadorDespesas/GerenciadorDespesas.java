package gerenciadorDespesas;

import java.util.Scanner;

public class GerenciadorDespesas {
	static String[] categorias = {"Alimentacao", "Transporte", "Lazer", "Outros"};
	static String[] diasSemana = {"Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"};
	static double[] gastosSemana = new double[7]; //7 dias da semana
	static double orcamentoMensal = 2000.0;
	static int dSemana = 0;
	static int categoria = 0;
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		mostrarMenu();
		//listarCategorias();
	}

	private static void mostrarMenu() {
		// TODO Auto-generated method stub
		int opcao;
		do {
			Scanner s = new Scanner(System.in);
			System.out.println("==== Selecione a Opcao =====");
			System.out.println("1. Registrar");
			System.out.println("2. Relatorio Dia");
			System.out.println("3. Relatorio Semana");
			System.out.println("4. Sair");
			opcao = s.nextInt();
			switch(opcao) {
			case 1:
				opcao = 1;
				registraGasto();
				break;
			case 2:
				opcao = 2;
				relatorioDia();
				break;
			case 3:
				opcao = 3;
				relatorioSemana();
				break;
			case 4:
				opcao = 4;
				System.out.println("Ate a proxima!");
				break;
			default:
				System.out.println("Opcao invalida!");
			}
		} while (opcao != 4);
	}
	
	private static void relatorioSemana() {
		// TODO Auto-generated method stub
		double total = 0;
		double maior = 0;
		int dia = -1;
		for(int i = 0; i < gastosSemana.length; i++) {
			double gastos = gastosSemana[i];
			total += gastos;
			
			if(gastos > maior) {
				maior = gastos;
				dia = i;
			}
		}
		
		System.out.println("Total gasto na semana = " + total);
		
		
		if(total > orcamentoMensal * 0.8) {
			System.out.println("Voce passou de 80% do orçamento!!");
		}
		if(dia != -1) {
		System.out.println("Maior gasto: R$" + maior + " foi na " + diasSemana[dia]);
	}}

	private static void relatorioDia() {
		// TODO Auto-generated method stub
		Scanner s = new Scanner(System.in);
		System.out.println("==== Selecione o dia da Semana =====");
		System.out.println("1 - Segunda-Feira");
		System.out.println("2 - Terca-Feira");
		System.out.println("3 - Quarta-Feira");
		System.out.println("4 - Quinta-Feira");
		System.out.println("5 - Sexta-Feira");
		System.out.println("6 - Sabado");
		System.out.println("7 - Domingo");
		dSemana = s.nextInt() -1;
		
		System.out.println("================");
		
		System.out.println("Gastos do dia = " + gastosSemana[dSemana]);
		if(gastosSemana[dSemana] > 150) {
			System.out.println("Gastos Altos Hoje!!");
		}
	}

	private static void registraGasto() {
		// TODO Auto-generated method stub
		Scanner s = new Scanner(System.in);
		System.out.println("==== Selecione o dia da Semana =====");
		System.out.println("1 - Segunda-Feira");
		System.out.println("2 - Terca-Feira");
		System.out.println("3 - Quarta-Feira");
		System.out.println("4 - Quinta-Feira");
		System.out.println("5 - Sexta-Feira");
		System.out.println("6 - Sabado");
		System.out.println("7 - Domingo");
		dSemana = s.nextInt() -1;
		
		System.out.println("================");
		System.out.println("==== Selecione a Categoria =====");
		System.out.println("1 - Alimetacao");
		System.out.println("2 - Transporte");
		System.out.println("3 - Lazer");
		System.out.println("4 - Outros");
		categoria = s.nextInt() -1;
		System.out.println("================");
		
		System.out.println("==== Digite o Valor do Gasto =====");
		double valor = s.nextDouble();
		
		//registra gasto no dia
		gastosSemana[dSemana] += valor;
		
		System.out.println("Gasto registrado: " + valor + " em " + categorias[categoria]);
	}

	private static void listarCategorias() {
		for(int i=0; i < categorias.length; i++) {
			System.out.println(categorias[i]);
		}
	}

}

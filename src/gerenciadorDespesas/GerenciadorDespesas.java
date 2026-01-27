package gerenciadorDespesas;

import java.util.Scanner;

public class GerenciadorDespesas {
	static String[] categorias = {"Alimentacao", "Transporte", "Lazer", "Outros"};
	static String[] diasSemana = {"Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"};
	static double[] gastosSemana = new double[7]; //7 dias da semana
	static Scanner s = new Scanner(System.in);
	static double orcamentoMensal = 2000.0;
	static int dSemana = 0;
	static int categoria = 0;
	static boolean valido;
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		mostrarMenu();
		//listarCategorias();
	}

	private static void mostrarMenu() {
		// TODO Auto-generated method stub
		int opcao;
		do {
			System.out.println("==== Selecione a Opcao =====");
			System.out.println("1. Registrar");
			System.out.println("2. Relatorio Dia");
			System.out.println("3. Relatorio Semana");
			System.out.println("4. Sair");
			opcao = lerInteiro("");
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
				linha();
				break;
			default:
				System.out.println("Opcao invalida!");
				linha();
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
		linha();
		
		
		if(total > orcamentoMensal * 0.8) {
			System.out.println("Voce passou de 80% do orcamento!!");
			linha();
		}
		if(dia != -1) {
		System.out.println("Maior gasto: R$" + maior + " foi na " + diasSemana[dia]);
		linha();
	}}

	private static void relatorioDia() {
		// TODO Auto-generated method stub
		
		do {
			System.out.println("==== Selecione o dia da Semana =====");
			System.out.println("1 - Segunda-Feira");
			System.out.println("2 - Terca-Feira");
			System.out.println("3 - Quarta-Feira");
			System.out.println("4 - Quinta-Feira");
			System.out.println("5 - Sexta-Feira");
			System.out.println("6 - Sabado");
			System.out.println("7 - Domingo");
			dSemana = lerInteiro("") -1;
			valido = validarDia(dSemana + 1);
		} while(!valido);
		
		linha();
		
		System.out.println("Gastos do dia = " + gastosSemana[dSemana]);
		if(gastosSemana[dSemana] > 150) {
			System.out.println("Gastos Altos Hoje!!");
		}
	}

	private static void registraGasto() {
		// TODO Auto-generated method stub
		do {
			System.out.println("==== Selecione o dia da Semana =====");
			System.out.println("1 - Segunda-Feira");
			System.out.println("2 - Terca-Feira");
			System.out.println("3 - Quarta-Feira");
			System.out.println("4 - Quinta-Feira");
			System.out.println("5 - Sexta-Feira");
			System.out.println("6 - Sabado");
			System.out.println("7 - Domingo");
			dSemana = lerInteiro("") -1;
			valido = validarDia(dSemana + 1);
		}while(!valido);
		
		do {
			linha();
			System.out.println("==== Selecione a Categoria =====");
			System.out.println("1 - Alimetacao");
			System.out.println("2 - Transporte");
			System.out.println("3 - Lazer");
			System.out.println("4 - Outros");
			categoria = lerInteiro("") -1;
			valido = validarCategoria(categoria + 1);
		}while(!valido);
		linha();
		
		System.out.println("==== Digite o Valor do Gasto =====");
		double valor = lerDouble("");
		//registra gasto no dia
		gastosSemana[dSemana] += valor;
		
		System.out.println("Gasto registrado: " + valor + " em " + categorias[categoria]);
	}

	private static void listarCategorias() {
		for(int i=0; i < categorias.length; i++) {
			System.out.println(categorias[i]);
		}
	}
	
	public static int lerInteiro(String mensagem) {
		System.out.print(mensagem);
		int valor = 0;
		try {
			valor = s.nextInt();
		}catch(Exception e) {
			e.printStackTrace();
		}
		return valor;
	}
	
	public static double lerDouble(String mensagem) {
		System.out.print(mensagem);
		double valor = 0;
		try {
			valor = s.nextDouble();
		}catch(Exception e) {
			e.printStackTrace();
		}
		return valor;
	}
	
	public static boolean validarDia(int dia) {
		return dia > 0 && dia <= 7;
	}
	
	public static boolean validarCategoria(int dia) {
		return dia > 0 && dia <= 4;
	}
	
	public static void linha() {
		 System.out.println("===========================");
	}

}

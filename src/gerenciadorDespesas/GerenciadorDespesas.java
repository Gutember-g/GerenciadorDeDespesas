package gerenciadorDespesas;

import java.util.Scanner;

public class GerenciadorDespesas {
	static String[] categorias = {"Alimentacao", "Transporte", "Lazer", "Outros"};
	static double[] gastosSemana = new double[7]; //7 dias da semana
	double orcamentoMensal = 2000.0;
	
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
		
	}

	private static void relatorioDia() {
		// TODO Auto-generated method stub
		
	}

	private static void registraGasto() {
		// TODO Auto-generated method stub
		
	}

	private static void listarCategorias() {
		for(int i=0; i < categorias.length; i++) {
			System.out.println(categorias[i]);
		}
	}

}

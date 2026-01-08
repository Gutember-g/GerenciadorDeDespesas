package gerenciadorDespesas;

public class GerenciadorDespesas {
	static String[] categorias = {"Alimentacao", "Transporte", "Lazer", "Outros"};
	static double[] gastosSemana = new double[7]; //7 dias da semana
	double orcamentoMensal = 2000.0;
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		mostrarMenu();
		listarCategorias();
	}

	private static void mostrarMenu() {
		// TODO Auto-generated method stub
		
	}
	
	private static void listarCategorias() {
		for(int i=0; i < categorias.length; i++) {
			System.out.println(categorias[i]);
		}
	}

}

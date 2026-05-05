const API_URL = 'http://localhost:8080/api';

export const dashboardAPI = {
    getSummary: async (userId: number) => {
        const response = await fetch(`${API_URL}/dashboard/summary/${userId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar resumo do dashboard');
        }
        return response.json();
    }
};

export const transactionAPI = {
    getTransactionsByUser: async (userId: number) => {
        const response = await fetch(`${API_URL}/transactions/user/${userId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar transações');
        }
        return response.json();
    },
    
    createTransaction: async (transactionData: any) => {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) {
            throw new Error('Erro ao criar transação');
        }
        return response.json();
    }
};

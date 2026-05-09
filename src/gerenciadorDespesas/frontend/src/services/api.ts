const API_URL = 'http://localhost:8080/api';

export const dashboardAPI = {
    getSummary: async (month?: number, year?: number) => {
        let url = `${API_URL}/summary`;
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar resumo do dashboard');
        }
        return response.json();
    },
    getLegacySummary: async (userId: number) => {
        const response = await fetch(`${API_URL}/dashboard/summary/${userId}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar resumo do dashboard');
        }
        return response.json();
    }
};

export const accountAPI = {
    getAccounts: async () => {
        const response = await fetch(`${API_URL}/accounts`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar contas');
        }
        return response.json();
    }
};

export const categoryAPI = {
    getCategories: async () => {
        const response = await fetch(`${API_URL}/categories`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar categorias');
        }
        return response.json();
    }
};

export const transactionAPI = {
    getTransactionsByUser: async (userId: number) => {
        const response = await fetch(`${API_URL}/transactions/user/${userId}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar transações');
        }
        return response.json();
    },

    getTransactions: async (month?: number, year?: number, description?: string) => {
        let url = `${API_URL}/transactions`;
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        if (description) params.append('descricao', description);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar transações filtradas');
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
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Erro ao criar transação');
        }
        return response.json();
    }
};

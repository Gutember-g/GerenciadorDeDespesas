const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export const authAPI = {
    login: async (email: string, senha: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('E-mail ou senha inválidos');
        }

        return response.json();
    },

    logout: async () => {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Erro ao sair');
        }

        return response.text();
    },

    updateProfile: async (nome: string, email: string) => {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email }),
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Erro ao atualizar perfil');
        }

        return response.json();
    },

    changePassword: async (senhaAtual: string, novaSenha: string) => {
        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senhaAtual, novaSenha }),
            credentials: 'include',
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Erro ao alterar senha');
        }

        return response.text();
    }
};

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
    },

    createCategory: async (categoryData: { name: string; type: string; budgetRuleType: string; color: string }) => {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao criar subcategoria');
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
    },

    updateTransaction: async (id: number, transactionData: any, editAllFuture?: boolean) => {
        const response = await fetch(`${API_URL}/transactions/${id}?editAllFuture=${!!editAllFuture}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar transação');
        }
        return response.json();
    },

    deleteTransaction: async (id: number, deleteAllFuture?: boolean) => {
        const response = await fetch(`${API_URL}/transactions/${id}?deleteAllFuture=${!!deleteAllFuture}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir transação');
        }
        return response;
    }
};

export const cardAPI = {
    getCards: async () => {
        const response = await fetch(`${API_URL}/cards`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Erro ao carregar cartões');
        }
        return response.json();
    },

    createCard: async (cardData: { name: string; brand: string; limitAmount: number; closingDay: number; dueDay: number; colorTheme: string }) => {
        const response = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardData),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao criar cartão');
        }
        return response.json();
    },

    updateCard: async (id: number, cardData: { name: string; brand: string; limitAmount: number; closingDay: number; dueDay: number; colorTheme: string }) => {
        const response = await fetch(`${API_URL}/cards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardData),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar cartão');
        }
        return response.json();
    },

    deleteCard: async (id: number) => {
        const response = await fetch(`${API_URL}/cards/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir cartão');
        }
        return response;
    }
};

export const goalAPI = {
    getGoals: async () => {
        const response = await fetch(`${API_URL}/goals`, { credentials: 'include' });
        if (!response.ok) throw new Error('Erro ao carregar metas');
        return response.json();
    },

    createGoal: async (goalData: {
        name: string;
        targetAmount: number;
        currentAmount: number;
        type: string;
        status?: string;
        deadline: string;
    }) => {
        const response = await fetch(`${API_URL}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao criar meta');
        return response.json();
    },

    updateGoal: async (id: number, goalData: {
        name: string;
        targetAmount: number;
        currentAmount: number;
        type: string;
        status?: string;
        deadline: string;
    }) => {
        const response = await fetch(`${API_URL}/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao atualizar meta');
        return response.json();
    },

    deleteGoal: async (id: number) => {
        const response = await fetch(`${API_URL}/goals/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao excluir meta');
        return response;
    },

    markAsCompleted: async (id: number) => {
        const response = await fetch(`${API_URL}/goals/${id}/complete`, {
            method: 'PATCH',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Erro ao concluir meta');
        return response.json();
    },

    getGoalTransactions: async (goalId: number) => {
        const response = await fetch(`${API_URL}/goals/${goalId}/transactions`, { credentials: 'include' });
        if (!response.ok) throw new Error('Erro ao carregar movimentações da meta');
        return response.json();
    },
};

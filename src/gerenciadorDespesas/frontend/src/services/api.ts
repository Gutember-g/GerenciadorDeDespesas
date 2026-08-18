const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

export const setAccessToken = (token: string | null) => {
    inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => {
    return inMemoryAccessToken;
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

export const refreshAccessToken = async (): Promise<{ accessToken: string; token: string; nome?: string; email?: string }> => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        setAccessToken(null);
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await response.json();
    const newAccessToken = data.accessToken || data.token;
    if (!newAccessToken) {
        setAccessToken(null);
        throw new Error('Falha ao renovar token de acesso');
    }

    setAccessToken(newAccessToken);
    return data;
};

export const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const makeRequest = (token: string | null) => {
        const headers = new Headers(init.headers || {});
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return fetch(input, {
            ...init,
            headers,
            credentials: 'include',
        });
    };

    let response = await makeRequest(inMemoryAccessToken);

    const inputUrl = typeof input === 'string' ? input : input.toString();
    const isAuthEndpoint = (
        inputUrl.includes('/auth/login') ||
        inputUrl.includes('/auth/register') ||
        inputUrl.includes('/auth/refresh') ||
        inputUrl.includes('/auth/logout')
    );

    if (response.status === 401 && !isAuthEndpoint) {
        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => makeRequest(token));
        }

        isRefreshing = true;

        try {
            const data = await refreshAccessToken();
            const newToken = data.accessToken || data.token;
            processQueue(null, newToken);
            return await makeRequest(newToken);
        } catch (error) {
            processQueue(error, null);
            setAccessToken(null);
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

export const authAPI = {
    refreshToken: async () => {
        return refreshAccessToken();
    },

    login: async (email: string, senha: string) => {
        const response = await authFetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        if (!response.ok) {
            throw new Error('E-mail ou senha inválidos');
        }

        const data = await response.json();
        if (data.token || data.accessToken) {
            setAccessToken(data.token || data.accessToken);
        }
        return data;
    },

    logout: async () => {
        try {
            const response = await authFetch(`${API_URL}/auth/logout`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Erro ao sair');
            }

            return response.text();
        } finally {
            setAccessToken(null);
        }
    },

    updateProfile: async (nome: string, email: string) => {
        const response = await authFetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Erro ao atualizar perfil');
        }

        const data = await response.json();
        if (data.token || data.accessToken) {
            setAccessToken(data.token || data.accessToken);
        }
        return data;
    },

    changePassword: async (senhaAtual: string, novaSenha: string) => {
        const response = await authFetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senhaAtual, novaSenha }),
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

        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error('Erro ao carregar resumo do dashboard');
        }
        return response.json();
    },
    getLegacySummary: async (userId: number) => {
        const response = await authFetch(`${API_URL}/dashboard/summary/${userId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar resumo do dashboard');
        }
        return response.json();
    }
};

export const accountAPI = {
    getAccounts: async () => {
        const response = await authFetch(`${API_URL}/accounts`);
        if (!response.ok) {
            throw new Error('Erro ao carregar contas');
        }
        return response.json();
    }
};

export const categoryAPI = {
    getCategories: async () => {
        const response = await authFetch(`${API_URL}/categories`);
        if (!response.ok) {
            throw new Error('Erro ao carregar categorias');
        }
        return response.json();
    },

    createCategory: async (categoryData: { name: string; type: string; budgetRuleType: string; color: string; iconName?: string }) => {
        const response = await authFetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            throw new Error('Erro ao criar subcategoria');
        }
        return response.json();
    },

    updateCategory: async (id: number, categoryData: { name?: string; type?: string; budgetRuleType?: string; color?: string; iconName?: string }) => {
        const response = await authFetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar categoria');
        }
        return response.json();
    },

    deleteCategory: async (id: number) => {
        const response = await authFetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir categoria');
        }
        return response;
    }
};

export const transactionAPI = {
    getTransactionsByUser: async (userId: number) => {
        const response = await authFetch(`${API_URL}/transactions/user/${userId}`);
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

        const response = await authFetch(url);
        if (!response.ok) {
            throw new Error('Erro ao carregar transações filtradas');
        }
        return response.json();
    },

    createTransaction: async (transactionData: any) => {
        const response = await authFetch(`${API_URL}/transactions`, {
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
    },

    updateTransaction: async (id: number, transactionData: any, editAllFuture?: boolean) => {
        const response = await authFetch(`${API_URL}/transactions/${id}?editAllFuture=${!!editAllFuture}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar transação');
        }
        return response.json();
    },

    deleteTransaction: async (id: number, deleteAllFuture?: boolean) => {
        const response = await authFetch(`${API_URL}/transactions/${id}?deleteAllFuture=${!!deleteAllFuture}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir transação');
        }
        return response;
    }
};

export const cardAPI = {
    getCards: async () => {
        const response = await authFetch(`${API_URL}/cards`);
        if (!response.ok) {
            throw new Error('Erro ao carregar cartões');
        }
        return response.json();
    },

    createCard: async (cardData: { name: string; brand: string; limitAmount: number; closingDay: number; dueDay: number; colorTheme: string }) => {
        const response = await authFetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardData),
        });
        if (!response.ok) {
            throw new Error('Erro ao criar cartão');
        }
        return response.json();
    },

    updateCard: async (id: number, cardData: { name: string; brand: string; limitAmount: number; closingDay: number; dueDay: number; colorTheme: string }) => {
        const response = await authFetch(`${API_URL}/cards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardData),
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar cartão');
        }
        return response.json();
    },

    deleteCard: async (id: number) => {
        const response = await authFetch(`${API_URL}/cards/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir cartão');
        }
        return response;
    }
};

export const goalAPI = {
    getGoals: async () => {
        const response = await authFetch(`${API_URL}/goals`);
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
        const response = await authFetch(`${API_URL}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
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
        const response = await authFetch(`${API_URL}/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
        });
        if (!response.ok) throw new Error('Erro ao atualizar meta');
        return response.json();
    },

    deleteGoal: async (id: number) => {
        const response = await authFetch(`${API_URL}/goals/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Erro ao excluir meta');
        return response;
    },

    markAsCompleted: async (id: number) => {
        const response = await authFetch(`${API_URL}/goals/${id}/complete`, {
            method: 'PATCH',
        });
        if (!response.ok) throw new Error('Erro ao concluir meta');
        return response.json();
    },

    getGoalTransactions: async (goalId: number) => {
        const response = await authFetch(`${API_URL}/goals/${goalId}/transactions`);
        if (!response.ok) throw new Error('Erro ao carregar movimentações da meta');
        return response.json();
    },
};

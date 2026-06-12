import { createContext, useContext, useState, type ReactNode } from 'react';

interface MesAtivo {
  month: number;
  year: number;
}

interface MesContextType {
  mesAtivo: MesAtivo;
  setMesAtivo: (mes: MesAtivo) => void;
  nextMonth: () => void;
  prevMonth: () => void;
}

const MesContext = createContext<MesContextType | undefined>(undefined);

export const MesProvider = ({ children }: { children: ReactNode }) => {
  const [mesAtivo, setMesAtivo] = useState<MesAtivo>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const nextMonth = () => {
    setMesAtivo(prev => {
      let nextMonth = prev.month + 1;
      let nextYear = prev.year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }
      return { month: nextMonth, year: nextYear };
    });
  };

  const prevMonth = () => {
    setMesAtivo(prev => {
      let prevMonth = prev.month - 1;
      let prevYear = prev.year;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear--;
      }
      return { month: prevMonth, year: prevYear };
    });
  };

  return (
    <MesContext.Provider value={{ mesAtivo, setMesAtivo, nextMonth, prevMonth }}>
      {children}
    </MesContext.Provider>
  );
};

export const useMes = () => {
  const context = useContext(MesContext);
  if (context === undefined) {
    throw new Error('useMes must be used within a MesProvider');
  }
  return context;
};
